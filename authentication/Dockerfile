FROM node:18.18.2 AS builder

WORKDIR /marketplace-auth

COPY package.json ./

# Install pnpm
RUN npm install -g pnpm typescript

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm run build

# Production image
FROM node:18.18.2-slim

ENV PORT 8000
ENV NODE_ENV production

WORKDIR /marketplace-auth

COPY --from=builder /marketplace-auth/dist ./dist
COPY --from=builder /marketplace-auth/drizzle ./drizzle
COPY --from=builder /marketplace-auth/package.json ./package.json
COPY --from=builder /marketplace-auth/entrypoint.sh ./entrypoint.sh
COPY --from=builder /marketplace-auth/swagger.json ./dist/swagger.json


RUN npm install --only=production

EXPOSE 8000

RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT [ "./entrypoint.sh" ]