# Stage 1: Builder (for dev & test)
FROM node:18-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Test
FROM builder AS test
CMD ["sh", "-c", "npm run migrate:test && npm run test"]

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]

