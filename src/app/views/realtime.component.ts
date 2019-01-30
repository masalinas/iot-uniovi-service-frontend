import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MQTTService } from '../services/mqtt.service';

declare var vis:any;

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

  onMqttMessageChangedEventHandler: EventEmitter<String>;

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

  public ngOnInit(): void {  
    this.configGraph();    
  }

  constructor(private mqttService: MQTTService) {
    this.onMqttMessageChangedEventHandler = this.mqttService.onMqttMessageChanged.subscribe((message) => {
      // console debug
      console.log('Message arrived : ' + message);

      // set x axis graph window
      this.renderStep();

      // filter mqtt message
      if (message > 0 && message < 40)
        this.addDataPoint(message, false);
      else
        this.addDataPoint(message, true);
    });
  }
}