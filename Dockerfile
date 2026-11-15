# Multi-stage build for Angular app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY iot-controller/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY iot-controller/ ./

# Build Angular app for production
RUN npm run build -- --configuration production

# Production stage with nginx
FROM nginx:alpine

# Copy built app from builder
COPY --from=builder /app/dist/iot-controller/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
