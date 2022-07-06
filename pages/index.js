import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/demo.module.css';

const CAMERA_CONSTRAINTS = {
  audio: true,
  video: true,
};

const getRecoderSettings = () => {
  const settings = {};
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    settings.format = 'mp4';
    settings.video = 'h264';
    settings.audio = 'aac';
  } else {
    settings.format = 'webm';
    settings.audio = 'opus';
    settings.video = MediaRecorder.isTypeSupported('video/webm;codecs=h264') ? 'h264' : 'vp8';
  }
  return settings;
}

const getRecorderMimeType = () => {
  const settings = getRecoderSettings();
  const codecs = settings.format === 'webm' ? `;codecs="${settings.video}, ${settings.audio}"` : '';
  return `video/${settings.format}${codecs}`;
}

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [textOverlay, setTextOverlay] = useState('Live from the browser!');

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

    ctx.fillStyle = '#FB3C4E';
    ctx.font = '50px Akkurat';
    const date = new Date();
    const dateText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    ctx.fillText(`${nameRef.current}${dateText}`, 10, 50, canvasRef.current.width - 20);

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
    const settings = getRecoderSettings();
    const protocol = window.location.protocol.replace('http', 'ws');
    const wsUrl = `${protocol}//${window.location.host}/rtmp?url=${streamUrl}&key=${streamKey}&video=${settings.video}&audio=${settings.audio}`;
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
      mimeType: getRecorderMimeType(),
      videoBitsPerSecond: 3000000,
      audioBitsPerSecond: 64000,
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
    nameRef.current = textOverlay;
  }, [textOverlay]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Wocket</title>
      </Head>

      <div className={styles.info}>
        <h1>Wocket</h1>
        <p>
          A demo using modern web technologies to broadcast video from a browser
          to a server via WebSockets. To learn more, see the <a href="https://github.com/MuxLabs/wocket">Github repo</a> or check out the <a href="https://mux.com/blog/the-state-of-going-live-from-a-browser/">Mux blog post</a> on the topic.
        </p>

        <p>
          This service is provided "as is," with no uptime guarantees, support, or any of the usual stuff people pay for.
        </p>

        {cameraEnabled &&
          (streaming ? (
            <div>
              <span
                className={`${styles.streamStatus} ${
                  connected ? styles.connected : styles.disconnected
                }`}
              >
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              <input
                placeholder="Text Overlay"
                type="text"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
              />
              <button onClick={stopStreaming}>Stop Streaming</button>
            </div>
          ) : (
            <>
              <input
                placeholder="rtmps://global-live.mux.com/app"
                type="text"
                onChange={(e) => setStreamUrl(e.target.value)}
              />
              <input 
                placeholder="Stream key"
                type="text"
                onChange={(e) => setStreamKey(e.target.value)} 
              />
              <button
                className={styles.startButton}
                disabled={!streamKey}
                onClick={startStreaming}
              >
                Start Streaming
              </button>
            </>
          ))}
      </div>
      <div
        className={`${styles.videoContainer} ${
          cameraEnabled && styles.cameraEnabled
        }`}
      >
        {!cameraEnabled && (
          <button className={styles.startButton} onClick={enableCamera}>
            Enable Camera
          </button>
        )}
        <div className={styles.inputVideo}>
          <video ref={videoRef} muted playsInline></video>
        </div>
        <div className={styles.outputCanvas}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};
