FROM node:20-alpine

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start the server
CMD ["node", "server.js"]