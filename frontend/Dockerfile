FROM node:25-alpine3.22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG REACT_APP_API_URL=https://psychosvaha.ru/api/v1
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

RUN npm install -g serve@14.2.4

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]