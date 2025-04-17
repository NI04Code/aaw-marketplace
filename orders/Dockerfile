FROM node:18.18.2 AS builder

WORKDIR /marketplace-order

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

WORKDIR /marketplace-order

COPY --from=builder /marketplace-order/dist ./dist
COPY --from=builder /marketplace-order/drizzle ./drizzle
COPY --from=builder /marketplace-order/package.json ./package.json
COPY --from=builder /marketplace-order/entrypoint.sh ./entrypoint.sh
COPY --from=builder /marketplace-order/swagger.json ./dist/swagger.json


RUN npm install --only=production

EXPOSE 8000

RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT [ "./entrypoint.sh" ]