#########################################
# Stage 0: Development (Hot Reload)
#########################################
FROM node:18-alpine AS dev
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Run in watch mode with ts-node-dev
CMD ["npm", "run", "dev"]



#########################################
# Stage 1: Builder (for dev & test)
#########################################
FROM node:18-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to /dist
RUN npm run build



#########################################
# Stage 2: Test
#########################################
FROM builder AS test
CMD ["sh", "-c", "npm run migrate:test && npm run test"]



#########################################
# Stage 3: Production
#########################################
FROM node:18-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JS and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database.js ./database.js
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000
CMD ["node", "dist/server.js"]

