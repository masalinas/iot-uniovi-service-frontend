
declare var ENV;

export const environment = {
  production: true,
  basePath: ENV.basePath === '$BASE_PATH' ? 'http://localhost:3000' : ENV.basePath,
  brokerPath: ENV.brokerPath === '$BROKER_PATH' ? 'http://localhost:9001' : ENV.brokerPath,
  brokerUsername: ENV.brokerUsername === '$BROKER_USERNAME' ? 'admin' : ENV.brokerUsername,
  brokerPassword: ENV.brokerPassword === '$BROKER_PASSWORD' ? 'uniovi' : ENV.brokerPassword,
  brokerDeviceTopic: ENV.brokerDeviceTopic === '$BROKER_DEVICE_TOPIC' ? 'uniovi/poc/#' : ENV.brokerDeviceTopic,
  brokerFeedbackTopic: ENV.brokerFeedbackTopic === '$BROKER_FEEDBACK_TOPIC' ? 'uniovi/poc/feedback' : ENV.brokerFeedbackTopic
};
