FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy client package files
COPY client/package*.json ./client/

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV EDUCATIONAL_DEMO=true
ENV SECURE_SITE=true
ENV ENABLE_CACHE=true
ENV COMPRESSION_LEVEL=6

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["npm", "start"] 