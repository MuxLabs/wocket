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

## Other projects

Some other projects I found when trying to figure out this whole canvas -> RTMP thing that were hugely helpful:

* [fbsamples/Canvas-Streaming-Example](https://github.com/fbsamples/Canvas-Streaming-Example)
* [chenxiaoqino/getusermedia-to-rtmp](https://github.com/chenxiaoqino/getusermedia-to-rtmp)

Other ways of solving this problem:

* [Pion](https://pion.ly/) - WebRTC implementation written in Go
* [Chromium Broadcasting](https://github.com/muxinc/chromium_broadcast_demo)
