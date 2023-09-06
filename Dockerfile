FROM node:18-alpine

WORKDIR /app
COPY package.json /app
COPY package-lock.json /app

RUN npm ci

COPY . /app

CMD ["node", "src/operator/index.js"]
