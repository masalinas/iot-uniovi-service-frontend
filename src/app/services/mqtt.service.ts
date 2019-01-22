import { Injectable } from '@angular/core';
import {Paho} from 'ng2-mqtt/mqttws31';

@Injectable()
export class MQTTService {
    client;

    constructor() {
        this.client = new Paho.MQTT.Client('127.0.0.1', 1885, 'uniovi');

        this.onMessage();
        this.onConnectionLost();

        this.client.connect({useSSL: false,
                             userName: 'admin',
                             password: 'uniovi',
                             onSuccess: this.onConnected.bind(this)});
    }

    onConnected() {
        console.log("Connected");

        this.client.subscribe('sensors/temperature');
        this.sendMessage('12.5');
    }

    sendMessage(message: string) {
        let packet = new Paho.MQTT.Message(message);
        packet.destinationName = "sensors/temperature";
        this.client.send(packet);
    }

    onMessage() {
        this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
          console.log('Message arrived : ' + message.payloadString);
        };
    }
    
    onConnectionLost() {
        this.client.onConnectionLost = (responseObject: Object) => {
          console.log('Connection lost : ' + JSON.stringify(responseObject));
        };
    }    
}