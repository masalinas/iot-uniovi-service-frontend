import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MQTTService } from './services/mqtt.service';

declare var vis:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {   
  @ViewChild("graphContainer") graphContainer: ElementRef;

  title = 'IoT Uniovi Dashboard';
  graph: any;
  dataset = new vis.DataSet();
  DELAY: number = 1000; 

  private onMqttMessageChangedEventHandler: EventEmitter<String>;

  // move the window (you can think of different strategies).
  private renderStep(): void {
    var now = vis.moment();
    var range = this.graph.getWindow();
    var interval = range.end - range.start;
    
    this.graph.setWindow(now - interval, now, {animation: false});
  }

  // add a new data point to the dataset
  private addDataPoint(point: any): void {
    var now = vis.moment();

    this.dataset.add({
      x: now,
      y: point,
      label: { content: point, yOffset: -10}
    });

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

  public ngOnInit(): void {  
    var options = {
      start: vis.moment().add(-30, 'seconds'), // changed so its faster
      end: vis.moment(),
      drawPoints: {
        style: 'circle' // square, circle
      },
      shaded: {
        orientation: 'bottom' // top, bottom
      }
    };

    let container = this.graphContainer.nativeElement;

    this.graph = new vis.Graph2d(container, this.dataset, options);

    //this.renderStep(this.graph);

    //this.addDataPoint();
  }

  constructor(private mqttService: MQTTService) {
    this.onMqttMessageChangedEventHandler = this.mqttService.onMqttMessageChanged.subscribe((message) => {

      console.log('Message arrived : ' + message);

      this.renderStep();
      this.addDataPoint(message);
  });
  }
}
