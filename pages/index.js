import React, { useCallback, useEffect, useState, useRef } from 'react';
import Head from 'next/head';

const CAMERA_CONSTRAINTS = {
  audio: true,
  video: { width: 960, height: 540 }
};

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [shoutOut, setShoutOut] = useState('you');

  const videoRef = useRef();
  const canvasRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();
  const nameRef = useRef();

  const enableCamera = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS
    );

    videoRef.current.srcObject = cameraStream;

    await videoRef.current.play();

    // We need to set the canvas height/width to match the video element.
    canvasRef.current.height = videoRef.current.clientHeight;
    canvasRef.current.width = videoRef.current.clientWidth;

    requestAnimationRef.current = requestAnimationFrame(updateCanvas);

    setCameraEnabled(true);
  };

  const updateCanvas = () => {
    if (videoRef.current.ended || videoRef.current.paused) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.clientWidth,
      videoRef.current.clientHeight
    );

    ctx.fillStyle = '#ff0000';
    ctx.font = '50px monospace';
    ctx.fillText(`Oh hi, ${nameRef.current}`, 5, 50);

    requestAnimationRef.current = requestAnimationFrame(updateCanvas);
  };

  const stopStreaming = () => {
    mediaRecorderRef.current.stop();
    setStreaming(false);
  };

  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace('http', 'ws');
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/rtmp?key=${streamKey}`
    );

    wsRef.current.addEventListener('open', function open() {
      setConnected(true);
    });

    wsRef.current.addEventListener('close', () => {
      setConnected(false);
      stopStreaming();
    });

    const mediaStream = canvasRef.current.captureStream(30); // 30 FPS
    mediaRecorderRef.current = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 3000000
    });

    mediaRecorderRef.current.addEventListener('dataavailable', e => {
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener('stop', () => {
      wsRef.current.close();
      stopStreaming();
    });

    mediaRecorderRef.current.start(1000);
  };

  useEffect(() => {
    nameRef.current = shoutOut;
  }, [shoutOut]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    }
  }, []);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <Head>
        <title>Streamr</title>
      </Head>
      <h1>Streamr</h1>

      {!cameraEnabled && (
        <button className="button button-outline" onClick={enableCamera}>
          Enable Camera
        </button>
      )}

      {cameraEnabled &&
        (streaming ? (
          <div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
            <button className="button button-outline" onClick={stopStreaming}>
              Stop Streaming
            </button>
          </div>
        ) : (
          <>
            <input
              placeholder="Stream Key"
              type="text"
              onChange={e => setStreamKey(e.target.value)}
            />
            <button
              className="button button-outline"
              disabled={!streamKey}
              onClick={startStreaming}
            >
              Start Streaming
            </button>
          </>
        ))}
      <div className="row">
        <div className="column">
          <h2>Input</h2>
          <video ref={videoRef} controls width="100%" height="auto" muted></video>
        </div>
        <div className="column">
          <h2>Output</h2>
          <canvas ref={canvasRef}></canvas>
          <input
            placeholder="Shout someone out!"
            type="text"
            onChange={e => setShoutOut(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
