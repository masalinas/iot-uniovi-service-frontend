import { Injectable, EventEmitter } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';

import { interval } from 'rxjs';

/** import angular environment variables **/
import { AppConfigurator } from '../shared/app.configurator';

@Injectable()
export class MQTTService {
    client: any;
    onMqttMessageChanged = new EventEmitter<String>(true);
    onMqttConnectionLost = new EventEmitter<boolean>(true);
    onMqttConnected = new EventEmitter<boolean>(false);
    connected = false;
    configurator = AppConfigurator;

    constructor() {}

    connect() {
        this.client = new Paho.MQTT.Client(this.configurator.getBrokerHostname(), 
                                           this.configurator.getBrokerPort(),
                                           this.configurator.getBrokerClientId());

        this.client.onConnectionLost = this.onConnectionLost.bind(this);
        this.client.onMessageArrived = this.onMessage.bind(this);

        try {
            this.client.connect({
                useSSL: false,
                userName: this.configurator.getBrokerUsername(),
                password: this.configurator.getBrokerPassword(),
                timeout: 10,
                keepAliveInterval: 60,
                onFailure: this.onFailure.bind(this),
                onSuccess: this.onConnected.bind(this)
            });
        } catch (ex) {
            console.log(ex);
        }

    }
    onFailure(invocationContext, errorCode) {
        const messageError = invocationContext.errorMessage;

        this.onMqttConnectionLost.emit(true);

        console.log(messageError);
    };

    onConnected() {
        this.onMqttConnected.emit(true);
        this.client.subscribe(AppConfigurator.getBrokerDeviceTopic());
        this.connected = true;
        
        console.log('Connected');
    }

    sendMessage(message: string) {
        let packet = new Paho.MQTT.Message(message);
        packet.destinationName = AppConfigurator.getBrokerFeedbackTopic();

        this.client.send(packet);
    }

    onMessage(message: Paho.MQTT.Message) {
        this.onMqttMessageChanged.emit(message.payloadString);
    }

    onConnectionLost() {
        this.connected = false;
        this.onMqttConnectionLost.emit(true);
        
        this.client.onConnectionLost = (responseObject: Object) => {
            console.log('Connection lost : ' + JSON.stringify(responseObject));
        };
    }
}