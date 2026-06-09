# ── Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies pehle copy karo — cache optimize hoti hai
COPY package*.json ./
RUN npm ci --only=production=false

# Source copy karo aur build karo
COPY . .
RUN npm run build

# ── Stage 2: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Sirf production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Built files copy karo
COPY --from=builder /app/dist ./dist

# ← ye add karo — logs folder banao pehle
RUN mkdir -p logs && chmod 777 logs

# Non-root user — security best practice
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "dist/index.js"]