# ------------------------------------------------------------------------------
# 1) Builder Stage: builds Typescript from backend directory
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
# Copy manifest files from backend directory for better caching
COPY backend/package*.* ./
RUN npm install
# Copy the rest of the backend directory
COPY backend/ ./
# Build the TypeScript project
RUN npm run build

# ------------------------------------------------------------------------------
# 2) Production Stage: runs the app from backend build
# ------------------------------------------------------------------------------
FROM node:22-alpine
WORKDIR /app
# Copy the build output from the builder, assuming it's in /app/out
COPY --from=builder /app/out ./out
# Copy production dependencies manifest from builder stage
COPY --from=builder /app/package*.* ./
RUN npm ci --production
# Expose is optional - Cloud Run ignores it, but good for local usage
EXPOSE 8080
# Start command, assuming index.js is in out/
CMD ["node", "out/index.js"]