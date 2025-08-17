## declare base image - node 20.13
FROM node:22.16 AS builder

WORKDIR /app
# Copy monorepo dependencies
COPY package.json yarn.lock node_modules ./
COPY apps/api/package.json ./apps/api/

# Github Action 에서 caching된 node_modules를 사용하기 위해 install하지 않음
# RUN yarn install --frozen-lockfile

# Copy API source code
COPY apps/api ./apps/api

# Generate environment variables and build
WORKDIR /app/apps/api

RUN yarn build

FROM node:22.16-alpine
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/config ./config
COPY --from=builder /app/apps/api/scripts ./scripts
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

EXPOSE 3000
CMD ["yarn", "start:prod"]