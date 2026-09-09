# ================================
# SPARK - Dockerfile
# ================================

# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project source code
COPY . .

# Build React frontend + Express backend
RUN npm run build


# ================================
# Stage 2: Production image
# ================================
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

# Application runs on port 3000
EXPOSE 3000

# Production environment
ENV NODE_ENV=production

# Start Express server
CMD ["npm", "start"]