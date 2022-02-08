FROM node:latest as build

ARG ENV=prod
ARG APP=iot-uniovi-service-frontend

ENV ENV ${ENV}
ENV APP ${APP}

# set app environment variables
ENV BASE_PATH http://192.168.1.55:3000
ENV BROKER_PATH http://192.168.1.55:1883
ENV BROKER_USERNAME admin
ENV BROKER_PASSWORD uniovi
ENV BROKER_DEVICE_TOPIC uniovi/poc/#
ENV BROKER_FEEDBACK_TOPIC uniovi/poc/feedback

# set app working folder
WORKDIR /app
COPY ./ /app/

# deploy app dependencies
RUN npm ci
RUN npm run build --prod
RUN mv /app/dist/${APP}/* /app/dist/

# install Angular app inside nginx webserver
FROM nginx:1.15.8-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf