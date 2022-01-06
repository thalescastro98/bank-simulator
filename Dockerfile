FROM node:16.13-alpine

WORKDIR /bank_simulator

COPY . .

RUN npm ci 

RUN npm run build

CMD npm run start