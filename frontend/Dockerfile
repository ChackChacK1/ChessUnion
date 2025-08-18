FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && \
    npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]