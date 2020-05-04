![Wocket](https://banner.mux.dev/?text=Wocket)

# Wocket (WebSocket to RTMP)

A proof-of-concept for live streaming video from your browser to an RTMP endpoint using [Next.js](https://nextjs.org) and a custom server with WebSockets. This is one of the ways we discussed how you _could_ theoretically let users broadcast live to a [Mux](https://mux.com) stream key from their browser using technology (WebSockets) that are a little more common. WebRTC is great, but the server-side story is still maturing.

## Clone the repo

```
git clone https://github.com/MuxLabs/wocket
cd wocket
```

## Setup

### Prerequisites to run locally

  * To run the server locally you will need to install [ffmpeg](https://www.ffmpeg.org/) and have the command `ffmpeg` in your $PATH. To see if it is installed correctly open up a terminal and type `ffmpeg`, if you see something that is not "command not found" then you're good!

For development you'll probably want to use `dev`, which will do little things like hot reloading automatically

```javascript
$ npm install
$ npm run dev
```

The last line you should see is something along the lines of:

```
$ > ready on port 3000
```

Visit that page in the browser and you should see Wocket!

## Running the application in production

Again, this should just be considered a proof of concept. I didn't write this to go to production. I beg you, don't rely on this as is for something important.

```
$ npm run build
$ npm start
```

## Deploying to fly.io

We will deploy the server with `flyctl`. Fly.io will use the Dockerfile to host the server.

1. Create a new fly.io app `flyctl apps create`
1. When asked about an app name, hit enter to get a generated name
1. When asked to overwrite the `fly.toml` file, say "yes"
1. Run `flyctl deploy` - this will deploy your app to fly.io


### Putting it all together

The intended way of using this would be to use the [`MediaRecorder` API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) and send video whenever the MediaRecorder instance fires the `dataavailable` event. The [demo front-end](pages/index.js) is an example of how you could wire everything together using the `getMediaRecorder` and the `MediaRecorder` API.

## Other projects

Some other projects I found when trying to figure out this whole canvas -> RTMP thing that were hugely helpful:

* [fbsamples/Canvas-Streaming-Example](https://github.com/fbsamples/Canvas-Streaming-Example)
* [chenxiaoqino/getusermedia-to-rtmp](https://github.com/chenxiaoqino/getusermedia-to-rtmp)

Other ways of solving this problem:

* [Pion](https://pion.ly/) - WebRTC implementation written in Go
* [Chromium Broadcasting](https://github.com/muxinc/chromium_broadcast_demo)
