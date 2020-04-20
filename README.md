# next-streamr

A proof-of-concept for live streaming video from your browser to an RTMP endpoint using [Next.js](https://nextjs.org) and a custom server with WebSockets. This is one of the ways we discussed how you _could_ theoretically let users broadcast live to a [Mux](https://mux.com) stream key from their browser using technology (WebSockets) that are a little more common. WebRTC is great, but the server-side story is still maturing.

## Setup

For development you'll probably want to use `dev`, which will do little things like automatically
```javascript
$ npm install
$ npm run dev
```

The last line you should see is something along the lines of:

```
$ > ready on port 3000
```

Visit that page in the browser and you should see Streamr!

## Running the application in production

Again, this should just be considered a proof of concept. I didn't write this to go to production. I beg you, don't rely on this as is for something important.

```
$ npm run build
$ npm start
```

## Using the Mux Labs deployment

This is deployed as a Mux Labs project. That means you can feel free to experiment with our deployment and use it, but be aware that this should be considered experimental. The public deployment has *no uptime guarantees* and they're not officially supported.

Connecting from your client:

```javascript
const ws = new WebSocket(`wss://ws-ingest.mux.dev/rtmp?key=${MUX_STREAM_KEY}`);
```

We will spawn an ffmpeg process after a successful connection. At that point you can start sending video over the open WS connection.

### Putting it all together

The intended way of using this would be to use the [`MediaRecorder` API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) and send video whenever the MediaRecorder instance fires the `dataavailable` event. The [demo front-end](pages/index.js) running on ws-ingest.mux.dev is an example of how one could do this in React, but here's a simplified workflow.

```javascript
(async () => {
  const videoEl = document.getElementById('video-input'); // This should be muted for autoplay to work!
  const canvasEl = document.getElementById('canvas-output');

  // request access to the webcam/mic
  const inputStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  });

  // Set something up to update the canvas element
  const updateCanvas = () => {
    if (videoEl.ended || videoEl.paused) {
      return;
    }

    const ctx = canvasEl.getContext('2d');

    ctx.drawImage(
      videoEl,
      0,
      0,
      videoEl.clientWidth,
      videoEl.clientHeight
    );

    requestAnimationFrame(updateCanvas);
  };

  // This returns a promise that will fail if the video can't autoplay
  await videoEl.play();

  // Assuming the above didn't throw, we can now kick off the `updateCanvas` loop
  updateCanvas();

  //
  const videoOutputStream = canvasEl.captureStream(30);

  // Let's do some extra work to get audio to join the party.
  // https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
  const audioStream = new MediaStream();
  const audioTracks = inputStream.getAudioTracks();
  audioTracks.forEach(function (track) {
    audioStream.addTrack(track);
  });

  const outputStream = new MediaStream();
  [audioStream, videoOutputStream].forEach(function (s) {
    s.getTracks().forEach(function (t) {
      outputStream.addTrack(t);
    });
  });

  // initialize a new instance of `MediaRecorder`
  const mediaRecorder = new MediaRecorder(outputStream, {
    mimeType: 'video/webm',
    videoBitsPerSecond: 3000000,
  });

  const ws = new WebSocket(`wss://ws-ingest.mux.dev/rtmp?key=${MUX_STREAM_KEY}`);

  // Set up an event listener so each blob of video is sent via the websocket when available
  mediaRecorder.addEventListener('dataavailable', (event) => {
    ws.send(event.data);
  });

  // if the media recorder stops then kill the websocket connection so the server can clean up
  mediaRecorder.addEventListener('stop', () => {
    ws.close();
  });

  // Now that everything is set up, kick off the mediaRecorder
  mediaRecorder.start(1000);
})();
```

## Other projects

Some other projects I found when trying to figure out this whole canvas -> RTMP thing that were hugely helpful:

* [fbsamples/Canvas-Streaming-Example](https://github.com/fbsamples/Canvas-Streaming-Example)
* [chenxiaoqino/getusermedia-to-rtmp](https://github.com/chenxiaoqino/getusermedia-to-rtmp)

Other ways of solving this problem:

* [Pion](https://pion.ly/) - WebRTC implementation written in Go
* [Chromium Broadcasting](https://github.com/muxinc/chromium_broadcast_demo)
