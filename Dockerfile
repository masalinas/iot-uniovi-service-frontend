FROM nginx:1.14.2-alpine
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY ./dist/iot-uniovi-ui /usr/share/nginx/html

# enviroment variables: 
# export const environment = {
#  production: true,
#  basePath: 'http://127.0.0.1:3000',
#  brokerPath: 'http://localhost:8080',
#  brokerDeviceTopic: 'uniovi/poc/#',
#  brokerFeedbackTopic: 'uniovi/poc/feedback'
#};


ENV BASE_PATH="http://127.0.0.1:3000"
ENV BROKER_PATH="http://localhost:8080"
ENV BROKER_DEVICE_TOPIC="uniovi/poc/#"
ENV BROKER_FEEDBACK_TOPIC="uniovi/poc/feedback"

COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Define it as the entrypoint script together with the path or directory that should be searched and substituted with the environment variables
ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "/usr/share/nginx/html/index.html"]

# Define the command that should be executed at the container startup
CMD ["nginx", "-g", "daemon off;"]