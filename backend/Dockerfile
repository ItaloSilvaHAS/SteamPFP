FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

CMD ["npm", "start"]