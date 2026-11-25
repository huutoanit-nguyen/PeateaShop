# ==========================================
# Stage 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Copy nginx template with dynamic PORT substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Default Render port
ENV PORT=80
EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
