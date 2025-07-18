FROM node:18-slim

WORKDIR /app
ENV NODE_ENV development

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
EXPOSE 3001