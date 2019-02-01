import { Injectable, EventEmitter } from '@angular/core';
import {Paho} from 'ng2-mqtt/mqttws31';

/** import angular environment variables **/
import { AppConfigurator } from '../shared/app.configurator';

import {interval} from 'rxjs';

const TIMEOUT: number = 3000; // 3 seconds
let isDone = false;

@Injectable()
export class MQTTService {
    client: any;    
    onMqttMessageChanged = new EventEmitter<String>(true);

    constructor() {
        this.connect();
    }

    connect() {
        this.client = new Paho.MQTT.Client(AppConfigurator.getBrokerHostname(), 
                                           AppConfigurator.getBrokerPort(),
                                           AppConfigurator.getBrokerClientId());

        this.onMessage();
        this.onConnectionLost();            

        this.client.connect({useSSL: false,
            userName: 'admin',
            password: 'uniovi',
            onSuccess: this.onConnected.bind(this)});
    }

    onConnected() {
        console.log("Connected");

        //this.client.subscribe('sensors/temperature');
        this.client.subscribe(AppConfigurator.getBrokerDeviceTopic());
    }

    sendMessage(message: string) {
        let packet = new Paho.MQTT.Message(message);
        //packet.destinationName = "sensors/temperature";
        packet.destinationName = AppConfigurator.getBrokerFeedbackTopic();

        this.client.send(packet);
    }

    onMessage()  {
        this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
          this.onMqttMessageChanged.emit(message.payloadString);
        };
    }    

    onConnectionLost() {
        this.client.onConnectionLost = (responseObject: Object) => {
          console.log('Connection lost : ' + JSON.stringify(responseObject));
                          
          /*interval(TIMEOUT).subscribe((value) => this.connect(),
                                               (error) => console.error(error));*/

          //setInterval(this.connect, TIMEOUT);
        };
    }    
}