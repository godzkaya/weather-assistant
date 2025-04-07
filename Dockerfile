FROM node:18-alpine

WORKDIR /app

# Install dependencies first (caching layer)
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
