import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import {FormControl} from '@angular/forms';

import {MatSnackBar} from '@angular/material';

import { MQTTService } from '../services/mqtt.service';
import { Configuration } from '../shared/sdk/models';
import { ConfigurationApi } from '../shared/sdk/services';

declare var vis:any;

const KEY: string = 'FREQUENCY';

@Component({
  selector: 'realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit {   
  title = 'Realtime Graph';

  @ViewChild("realTimeContainer") container: ElementRef;

  dataset = new vis.DataSet();  
  graph: any;

  frequency = new FormControl(10);

  onMqttMessageChangedEventHandler: EventEmitter<String>;

  private getFrequencyLength(): string {
    return this.frequency.value.toString().length;
  }

  // move the window (you can think of different strategies).
  private renderStep(): void {
    var now = vis.moment();
    var range = this.graph.getWindow();
    var interval = range.end - range.start;
    
    this.graph.setWindow(now - interval, now, {animation: false});
  }

  // add a new data point to the dataset
  private addDataPoint(data: any, alarm: boolean): void {
    var now = vis.moment();

    let point: object;

    if (alarm == true)
      point = {
        x: now,
        y: data,
        label: { content: data, yOffset: 15, className: "alarm"}
      }
    else
      point = {
        x: now,
        y: data,
        label: { content: data, yOffset: 15}
      }

    this.dataset.add(point);

    // remove all data points which are no longer visible
    var range = this.graph.getWindow();
    var interval = range.end - range.start;
    var oldIds = this.dataset.getIds({
      filter: function (item) {
        return item.x < range.start - interval;
      }
    });
    this.dataset.remove(oldIds);
  }

  private configGraph() {    
    // configure realtime graph
    var options = {
      start: vis.moment().add(-30, 'seconds'), // changed so its faster
      end: vis.moment(),
      drawPoints: {
        style: 'circle' // square, circle
      },
      shaded: {
        orientation: 'bottom' // top, bottom
      },
      dataAxis: {
        left: {title: {
          text:'Temperature [℃]'}
        }
      }
    };

    let container = this.container.nativeElement;
    this.graph = new vis.Graph2d(container, this.dataset, options);   
  }

  onSaveFrequency(event: any) {  
    this.configurationApi.updateKey(KEY, this.frequency.value).subscribe((configuration: Configuration) => { 
      console.log('Frecuency: ' + this.frequency.value.toString().length);

      this.snackBar.open('The configuration was saved!', 'Ok', {
        duration: 3000,
      });
    });
  }

  public ngOnInit(): void {  
    this.configGraph();   
    
    this.configurationApi.getByKey(KEY).subscribe((configuration: Configuration) => { 
      this.frequency.setValue(configuration.value);
    });
  }

  constructor(private mqttService: MQTTService, private configurationApi: ConfigurationApi, private snackBar: MatSnackBar) {
    this.onMqttMessageChangedEventHandler = this.mqttService.onMqttMessageChanged.subscribe((message) => {
      var measure = JSON.parse(message);

      // console debug
      console.log('Measure arrived : ' + message);

      // set x axis graph window
      this.renderStep();
      
      // filter mqtt measure
      if (measure.device == 'TP01') {
        if (measure.value > 0 && measure.value < 40)
          this.addDataPoint(measure.value, false);
        else
          this.addDataPoint(measure.value, true);
      }
    });
  }
}