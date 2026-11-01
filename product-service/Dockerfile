# ---- deps stage: install production dependencies only ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime stage: small final image, no build tools, no dev deps ----
FROM node:20-alpine
WORKDIR /app

# Run as a non-root user rather than the default root inside the
# container — standard hardening, costs nothing here.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=deps /app/node_modules ./node_modules
COPY package.json index.js ./
USER appuser

EXPOSE 3000
ENV PORT=3000
CMD ["node", "index.js"]
