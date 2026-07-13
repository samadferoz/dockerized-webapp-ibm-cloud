# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the application code
COPY . .

# App listens on port 3000
EXPOSE 3000

# Set environment variable
ENV PORT=3000

# Start the app
CMD ["npm", "start"]
