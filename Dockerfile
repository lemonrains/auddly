FROM node:16.17.0-alpine3.15 as build-step

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm i

COPY ./ /app

RUN npm run build --prod
# RUN npm run build

FROM nginx:1.17.1-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-step /app/dist /usr/share/nginx/html
