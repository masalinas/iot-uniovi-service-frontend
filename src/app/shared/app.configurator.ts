import { environment } from '../../environments/environment';

export class AppConfigurator {
    public static getApiVersion(): string {
        return "api";
    }

    public static getApiProtocol(): string {
        const url = new URL(environment.basePath);

        return url.protocol;
    }
    
    public static getApiHostname(): string {
        const url = new URL(environment.basePath);

        return url.hostname;
    }

    public static getApiPort(): string {
        const url = new URL(environment.basePath);

        return url.port;
    }
    
    public static getBrokerHostname(): string {
        const url = new URL(environment.brokerPath);

        return url.hostname;
    }

    public static getBrokerPort(): number {
        const url = new URL(environment.brokerPath);

        return Number(url.port);
    }  
    
    public static getBrokerUsername(): string {
        return environment.brokerUsername;
    }  

    public static getBrokerPassword(): string {
        return environment.brokerPassword;
    }  

    public static getBrokerClientId(): string {
        // For an RFC4122 version 4 compliant solution
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }    
    
    public static getBrokerDeviceTopic(): string {
        return environment.brokerDeviceTopic;
    }

    public static getBrokerFeedbackTopic(): string {
        return environment.brokerFeedbackTopic;
    }    
}