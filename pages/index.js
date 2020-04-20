import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from './styles.module.css';

const CAMERA_CONSTRAINTS = {
  audio: true,
  video: { width: 960, height: 540 },
};

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [shoutOut, setShoutOut] = useState('you');

  const inputStreamRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();
  const nameRef = useRef();

  const enableCamera = async () => {
    inputStreamRef.current = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS
    );

    videoRef.current.srcObject = inputStreamRef.current;

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
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setStreaming(false);
  };

  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace('http', 'ws');
    // const wsUrl = `${protocol}//${window.location.host}/rtmp?key=${streamKey}`;
    const wsUrl = `wss://next-streamr.fly.dev/rtmp?key=${streamKey}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.addEventListener('open', function open() {
      setConnected(true);
    });

    wsRef.current.addEventListener('close', () => {
      setConnected(false);
      stopStreaming();
    });

    const videoOutputStream = canvasRef.current.captureStream(30); // 30 FPS

    // Let's do some extra work to get audio to join the party.
    // https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
    const audioStream = new MediaStream();
    const audioTracks = inputStreamRef.current.getAudioTracks();
    audioTracks.forEach(function (track) {
      audioStream.addTrack(track);
    });

    const outputStream = new MediaStream();
    [audioStream, videoOutputStream].forEach(function (s) {
      s.getTracks().forEach(function (t) {
        outputStream.addTrack(t);
      });
    });

    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 3000000,
    });

    mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener('stop', () => {
      stopStreaming();
      wsRef.current.close();
    });

    mediaRecorderRef.current.start(1000);
  };

  useEffect(() => {
    nameRef.current = shoutOut;
  }, [shoutOut]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
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
            <button onClick={stopStreaming}>Stop Streaming</button>
          </div>
        ) : (
          <>
            <input
              placeholder="Stream Key"
              type="text"
              onChange={(e) => setStreamKey(e.target.value)}
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
      <div className={styles.videoContainer}>
        <div className={styles.inputVideo}>
          <video
            ref={videoRef}
            width="100%"
            height="auto"
            muted
            playsInline
          ></video>
        </div>
        <div className={styles.outputCanvas}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
      <input
        placeholder="Shout someone out!"
        type="text"
        onChange={(e) => setShoutOut(e.target.value)}
      />
    </div>
  );
};
