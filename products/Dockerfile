FROM node:18.18.2 AS builder

WORKDIR /marketplace-product

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

WORKDIR /marketplace-product

COPY --from=builder /marketplace-product/dist ./dist
COPY --from=builder /marketplace-product/drizzle ./drizzle
COPY --from=builder /marketplace-product/package.json ./package.json
COPY --from=builder /marketplace-product/entrypoint.sh ./entrypoint.sh
COPY --from=builder /marketplace-product/swagger.json ./swagger.json


RUN npm install --only=production

EXPOSE 8000

RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT [ "./entrypoint.sh" ]