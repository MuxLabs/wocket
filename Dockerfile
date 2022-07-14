FROM node:current-alpine
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN apk add  --no-cache ffmpeg && npm install --production

COPY . .

RUN npm run build

ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "start" ]
