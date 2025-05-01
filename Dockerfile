# Stage 1: Base image.
FROM node:lts as base

RUN corepack enable

WORKDIR /api

## Copy over the source code.
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src src/

## Run

CMD ["npm", "start", "start"]