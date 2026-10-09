FROM node:22-alpine AS dependencies
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG DATABASE_URL=postgresql://build:[REDACTED]@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}

RUN --mount=type=secret,id=better_auth_secret,required=false \
    export BETTER_AUTH_SECRET="$(cat /run/secrets/better_auth_secret 2>/dev/null || printf '%s' build-only-secret)" && \
    npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
