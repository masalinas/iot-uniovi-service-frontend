import { Component, OnInit } from '@angular/core';
import { MQTTService } from '../../services/mqtt.service';
import * as moment from 'moment';

@Component({
  selector: 'app-mqtt',
  templateUrl: './mqtt.component.html',
  styleUrls: ['./mqtt.component.css']
})
export class MqttComponent implements OnInit {

  connected = false;
  lostConnected = true;
  color = 'red';
  lastupdate: string;
  connect = 0;

  constructor(private mqttService: MQTTService) {
    this.mqttService.onMqttMessageChanged.subscribe((message) => {
      this.lastupdate = moment().locale('en').format("DD/MM/YYYY HH:mm:ss");
    });

    this.mqttService.onMqttConnectionLost.subscribe((lost) => {
      console.log('conection lost');

      this.color = 'red';
      this.connected = false;
      this.connect += 1;
      this.mqttService.connect();
    });
    this.mqttService.onMqttConnected.subscribe((connected) => {
      this.connect = 0;
      this.color = 'green';
      this.connected = true;

      console.log('connected');
    });
  }

  ngOnInit() {
    this.color = (this.mqttService.connected) ? 'green' : 'red';

    if (!this.mqttService.connected)
      this.mqttService.connect();    
  }
}
