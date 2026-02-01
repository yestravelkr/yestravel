## declare base image - node 22.16
FROM node:22.16 AS builder

WORKDIR /app

# Copy monorepo dependencies
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/option-selector/package.json ./packages/option-selector/

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/option-selector ./packages/option-selector

# Build option-selector package first
WORKDIR /app/packages/option-selector
RUN yarn build

# Build API
WORKDIR /app/apps/api
RUN yarn build

FROM node:22.16-alpine
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

WORKDIR /app

# Copy monorepo structure for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/option-selector ./packages/option-selector

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/config ./apps/api/config
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

EXPOSE 3000
WORKDIR /app/apps/api
CMD ["yarn", "start:prod"]