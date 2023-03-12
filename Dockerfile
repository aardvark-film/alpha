FROM node:18

WORKDIR /app

ADD . .

RUN yarn

RUN yarn build
