FROM node:latest

WORKDIR /app

COPY . /app

RUN npm ci

CMD [ "npm", "run", "test:all" ]
