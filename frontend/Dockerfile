FROM node:25-alpine3.22

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]