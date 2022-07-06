![Wocket](https://banner.mux.dev/?text=Wocket)

# Wocket (WebSocket to RTMP)

This project is a proof-of-concept to demonstrate how you can stream live from your browser to an RTMP server. Streaming via RTMP is how you stream to Twitch, Youtube Live, Facebook Live, and other live streaming platforms. Typically, this requires running a local encoder software (for example: [OBS](https://obsproject.com/) or [Ecamm Live](https://www.ecamm.com/mac/ecammlive/)). Those are great products and if you are streaming seriously you probably still want to use them. But we threw this project together to show how you might be able to pull off the same thing from a browser. In this example, instead of streaming to something like Twitch, Youtube Live, etc, we will be using the live streaming API provided by Mux, which gives you an on-demand RTMP server that you can stream to.


This project uses [Next.js](https://nextjs.org) and a custom server with WebSockets. It should be noted that this project is a fun proof-of-concept. If you want to learn more about the challenges of going live from the browser take a look at this blog post [The state of going live from a browser](https://mux.com/blog/the-state-of-going-live-from-a-browser/).

This is what this project looks like. This will access the browser's webcam and render it onto a canvas element. When you enter a stream key and click "Start Streaming" it will stream your webcam to a [Mux live stream](https://docs.mux.com/docs/live-streaming).

![Wocket Screenshot](./screenshots/wocket-live-browser-1.png?raw=true)
![Wocket Mobile Screenshot](./screenshots/wocket-live-browser-2.png?raw=true)
## Clone the repo

```
git clone https://github.com/MuxLabs/wocket
cd wocket
```

## Setup

### Prerequisites to run locally

  * To run the server locally you will need to install [ffmpeg](https://www.ffmpeg.org/) and have the command `ffmpeg` in your $PATH. To see if it is installed correctly open up a terminal and type `ffmpeg`, if you see something that is not "command not found" then you're good!

For development you'll probably want to use `dev`, which will do little things like hot reloading automatically.

```javascript
$ npm install
$ npm run dev
```

The last line you should see is something along the lines of:

```
$ > ready on port 3000
```

Visit that page in the browser and you should see Wocket!

### Getting a Mux stream key

To get a stream key and actually start streaming to an RTMP ingest URL you will need a [free Mux account](https://dashboard.mux.com/signup?type=video). After you sign up create a live stream either [with the API](https://docs.mux.com/docs/live-streaming) or by navigating to 'Live Streams' in the dashboard and clicking 'Create New Live Stream' see below:

![Mux Dashboard Live Stream](./screenshots/mux-live-stream-dashboard.gif?raw=true).

Without entering a credit card your live streams are in 'test' mode which means they are limited to 5 minutes, watermarked with the Mux logo and deleted after 24 hours. If you enter a credit card you get $20 of free credit which unlocks the full feature set and removes all limits. The $20 of credit should be plenty to cover the costs of experimenting with the API and if you need some more for experimentation please drop us a line and let us know!

## Running the application in production

Again, this should just be considered a proof of concept. I didn't write this to go to production. I beg you, don't rely on this as is for something important.

```
$ npm run build
$ npm start
```

When hosting the application to an external server, it needs to use HTTPS (A non secure web site wont have access to the camera).  You can use a self signed certificate for testing but on the client side you will have to trust that certificate. You can run it as
```
$ export CERT_FILE=<path to your cert file>
$ export KEY_FILE=<path to your certificate key file>
$ export HOST=0.0.0.0  // or the IP address you want to bind to.
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
