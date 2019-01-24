import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  private renderStep(graph): void {
    // move the window (you can think of different strategies).
    var now = vis.moment();
    var range = graph.getWindow();
    var interval = range.end - range.start;
    
    graph.setWindow(now - interval, now, {animation: false});
    setTimeout(() => { this.renderStep }, this.DELAY);    
  }

  private y(x): number {
    return (Math.sin(x / 2) + Math.cos(x / 4)) * 5;
  }

  private addDataPoint(graph): void {
    // add a new data point to the dataset
    var now = vis.moment();

    this.dataset.add({
      x: now,
      y: this.y(now / 1000)
    });

    // remove all data points which are no longer visible
    var range = graph.getWindow();
    var interval = range.end - range.start;
    var oldIds = this.dataset.getIds({
      filter: function (item) {
        return item.x < range.start - interval;
      }
    });
    this.dataset.remove(oldIds);

    //setTimeout(() => { this.addDataPoint }, this.DELAY);
  }

  public ngOnInit(): void {  
    var options = {
      start: vis.moment().add(-30, 'seconds'), // changed so its faster
      end: vis.moment(),
      dataAxis: {
        left: {
          range: {
            min:-10, max: 10
          }
        }
      },
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

    this.addDataPoint(this.graph);
  }

  constructor(private mqttService: MQTTService) {}
}
