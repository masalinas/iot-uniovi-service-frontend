import { Injectable, EventEmitter } from '@angular/core';
import {Paho} from 'ng2-mqtt/mqttws31';

import {interval} from 'rxjs';

const reconnectTimeout: number = 3000; // 3 seconds
let isDone = false;

@Injectable()
export class MQTTService {
    client: any;
    onMqttMessageChanged = new EventEmitter<String>(true);
    onMqttConnectionLost = new EventEmitter<boolean>(true);
    onMqttConnected = new EventEmitter<boolean>(false);
    connected = false;
    constructor() {
        // this.connect();
    }

    connect() {
        this.client = new Paho.MQTT.Client('127.0.0.1', 8085, 'web_client');

        //this.onMessage();
        //this.onConnectionLost();
// set callback handlers
        this.client.onConnectionLost = this.onConnectionLost.bind(this);
        this.client.onMessageArrived = this.onMessage.bind(this);
        try {
            this.client.connect({useSSL: false,
                userName: 'admin',
                password: 'uniovi',
                timeout: 10,
                keepAliveInterval: 60,
                onFailure: this.onFailure.bind(this),
                onSuccess: this.onConnected.bind(this)});
        } catch (ex) {
            console.log(ex);
        }

    }
    onFailure(invocationContext, errorCode) {
        this.onMqttConnectionLost.emit(true);
        console.log('fallo');
    }
    onConnected() {
        console.log('Connected');
        this.onMqttConnected.emit(true);
        this.client.subscribe('sensors/temperature');
        this.connected = true;
        // this.sendMessage('0.0');
    }

    sendMessage(message: string) {
        let packet = new Paho.MQTT.Message(message);
        packet.destinationName = 'sensors/temperature';

        this.client.send(packet);
    }

    onMessage(message: Paho.MQTT.Message)  {
        this.onMqttMessageChanged.emit(message.payloadString);
    }

    onConnectionLost() {
        this.connected = false;
        this.onMqttConnectionLost.emit(true);
        this.client.onConnectionLost = (responseObject: Object) => {
          console.log('Connection lost : ' + JSON.stringify(responseObject));
                          
          /*interval(reconnectTimeout).subscribe((value) => this.connect(),
                                               (error) => console.error(error));*/

          //setInterval(this.connect, reconnectTimeout);
        };
    }    
}