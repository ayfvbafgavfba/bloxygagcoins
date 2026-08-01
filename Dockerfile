# Builder: build frontend
FROM node:18.20.0-bullseye AS builder
WORKDIR /app

# Copy frontend sources and install deps
COPY growcsn-frontend/package*.json ./growcsn-frontend/
RUN npm ci --prefix growcsn-frontend
COPY growcsn-frontend/ ./growcsn-frontend/
RUN npm run --prefix growcsn-frontend build

# Final image: install backend deps and copy frontend build
FROM node:18.20.0-bullseye
WORKDIR /app

# Install backend deps
COPY growcsn-backend/package*.json ./growcsn-backend/
RUN npm ci --production --prefix growcsn-backend

# Copy backend source
COPY growcsn-backend/ ./growcsn-backend/

# Copy built frontend into place so backend can serve it
COPY --from=builder /app/growcsn-frontend/dist /app/growcsn-frontend/dist

ENV NODE_ENV=production
EXPOSE 5001

# Default command
CMD ["node", "growcsn-backend/index.js"]
