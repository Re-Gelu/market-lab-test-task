FROM node:20-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build


FROM node:20-alpine

WORKDIR /usr/app

COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/package*.json ./
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/prisma ./prisma

EXPOSE 8000

CMD [ "yarn", "start:migrate:prod" ]