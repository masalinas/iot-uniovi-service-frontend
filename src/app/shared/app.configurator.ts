import { environment } from '../../environments/environment';

export class AppConfigurator {
    /**
     * @method getApiHostname
     * @author Miguel Salinas
     * @license MIT
     * This method returns hostname from environment
     **/
    public static getApiHostname(): string {
        const url = new URL(environment.basePath);

        return url.hostname;
    }

    /**
     * @method getApiPort
     * @author Miguel Salinas
     * @license MIT
     * This method returns port from environment
     **/
    public static getApiPort(): string {
        const url = new URL(environment.basePath);

        return url.port;
    }
    
    /**
     * @method getApiProtocol
     * @author Miguel Salinas
     * @license MIT
     * This method returns protocol from environment
     **/
    public static getApiProtocol(): string {
        const url = new URL(environment.basePath);

        return url.protocol;
    }

    /**
     * @method getApiVersion
     * @author Miguel Salinas
     * @license MIT
     * This method returns host name from environment
     **/
    public static getApiVersion(): string {
        return "api";
    }

    /**
     * @method getClientId
     * @author Miguel Salinas
     * @license MIT
     * This method returns host name from environment
     **/
    /*public static getClientId(): string {
        return environment.clientId;
    }*/

    /**
     * @method getClientSecret
     * @author Miguel Salinas
     * @license MIT
     * This method returns host name from environment
     **/
    /*public static getClientSecret(): string {
        return environment.clientSecret;
    }*/ 
    
    /**
     * @method getBrokerHostname
     * @author Miguel Salinas
     * @license MIT
     * This method returns hostname from environment
     **/
    public static getBrokerHostname(): string {
        const url = new URL(environment.brokerPath);

        return url.hostname;
    }

    /**
     * @method getBrokerPort
     * @author Miguel Salinas
     * @license MIT
     * This method returns port from environment
     **/
    public static getBrokerPort(): number {
        const url = new URL(environment.brokerPath);

        return Number(url.port);
    }  
    
    /**
     * @method getBrokerClientId
     * @author Miguel Salinas
     * @license MIT
     * This method returns port from environment
     **/
    public static getBrokerClientId(): string {
        // For an RFC4122 version 4 compliant solution
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }       
}