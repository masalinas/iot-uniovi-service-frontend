import { Injectable, EventEmitter } from '@angular/core';
import {Paho} from 'ng2-mqtt/mqttws31';

/** import angular environment variables **/
import { BASE_URL, API_VERSION } from '../shared/sdk/base.url';

import {interval} from 'rxjs';

const reconnectTimeout: number = 3000; // 3 seconds
let isDone = false;

@Injectable()
export class MQTTService {
    client: any;    
    onMqttMessageChanged = new EventEmitter<String>(true);

    constructor() {
        this.connect();
    }

    connect() {
        this.client = new Paho.MQTT.Client('0.0.0.0', 8080, 'web_client');
        //this.client = new Paho.MQTT.Client('192.168.1.27', 8080, 'web_client');

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
        //this.sendMessage('0.0');
    }

    sendMessage(message: string) {
        let packet = new Paho.MQTT.Message(message);
        packet.destinationName = "sensors/temperature";

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
                          
          /*interval(reconnectTimeout).subscribe((value) => this.connect(),
                                               (error) => console.error(error));*/

          //setInterval(this.connect, reconnectTimeout);
        };
    }    
}