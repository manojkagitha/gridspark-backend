# ==============================
# Base Image
# ==============================
FROM node:18-alpine AS base

# Create and set working directory
WORKDIR /usr/src/app

# Install dependencies required for runtime & healthcheck
RUN apk add --no-cache curl

# ==============================
# Dependency Installation Stage
# ==============================
FROM base AS deps

COPY package*.json ./
RUN npm ci --omit=dev

# ==============================
# Build Stage (for future builds)
# ==============================
FROM deps AS build
COPY . .

# ==============================
# Production Runtime
# ==============================
FROM node:18-alpine

WORKDIR /usr/src/app
RUN apk add --no-cache curl

# Copy only what's needed from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose app port
EXPOSE 3000

# ==============================
# Healthcheck
# ==============================
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fs http://localhost:3000/health || exit 1

# ==============================
# Start the Node.js Server
# ==============================
CMD ["node", "index.js"]
