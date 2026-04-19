FROM node:25-alpine3.22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG REACT_APP_API_URL=https://psychosvaha.ru/api/v1
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

CMD ["npm", "start"]