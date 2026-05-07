FROM node:24-alpine AS dependencies

WORKDIR /usr/src/kaos-simulator

COPY package*.json ./

RUN npm ci

FROM node:24-alpine AS build

WORKDIR /usr/src/kaos-simulator

COPY --from=dependencies /usr/src/kaos-simulator/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/kaos-simulator

RUN apk add --no-cache stress-ng && \
    addgroup -S kaos-simulator && \
    adduser -S kaos-simulator -G kaos-simulator && \
    mkdir -p /tmp/stress-ng && \
    chown -R kaos-simulator:kaos-simulator /tmp/stress-ng

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=kaos-simulator:kaos-simulator /usr/src/kaos-simulator/dist ./dist
COPY --from=build --chown=kaos-simulator:kaos-simulator /usr/src/kaos-simulator/public ./public

USER kaos-simulator

EXPOSE 3000

CMD ["node", "dist/main.js"]