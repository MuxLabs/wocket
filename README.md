![Websocket to RTMP](https://banner.mux.dev/?text=WS->RTMP)

# WebSocket to RTMP

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
const ws = new WebSocket(`wss://ws.mux.dev/rtmp?key=${MUX_STREAM_KEY}`);
```

We will spawn an ffmpeg process after a successful connection. At that point you can start sending video over the open WS connection.

### Putting it all together

The intended way of using this would be to use the [`MediaRecorder` API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) and send video whenever the MediaRecorder instance fires the `dataavailable` event. The [demo front-end](pages/index.js) is an example of how you could wire everything together using the `getMediaRecorder` and the `MediaRecorder` API.

## Other projects

Some other projects I found when trying to figure out this whole canvas -> RTMP thing that were hugely helpful:

* [fbsamples/Canvas-Streaming-Example](https://github.com/fbsamples/Canvas-Streaming-Example)
* [chenxiaoqino/getusermedia-to-rtmp](https://github.com/chenxiaoqino/getusermedia-to-rtmp)

Other ways of solving this problem:

* [Pion](https://pion.ly/) - WebRTC implementation written in Go
* [Chromium Broadcasting](https://github.com/muxinc/chromium_broadcast_demo)
