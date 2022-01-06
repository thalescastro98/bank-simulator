FROM node:16.13-alpine

WORKDIR /bank_simulator

COPY . .

RUN npm ci

CMD npm run dev