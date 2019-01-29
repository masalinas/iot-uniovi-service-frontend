import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl} from '@angular/forms';

import { Measure } from '../shared/sdk/models';
import { MeasureApi } from '../shared/sdk/services';

declare var vis:any;

@Component({
  selector: 'historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.css']
})
export class HistoricComponent implements OnInit {   
  title = 'Historic Graph';

  measures : Measure[];

  dateFrom = new FormControl(new Date());
  dateTo = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());

  @ViewChild("historicContainer") container: ElementRef;

  dataset = new vis.DataSet();  
  graph: any;

  public ngOnInit(): void {  
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

  onLoad(event: any) {  
    this.measureApi.find({where: {device: 'TP01'}}).subscribe((result: Measure[]) => { 
      this.measures = result;    

      console.log(this.measures);
    },
    error => {
      console.log(error);
    });
  }    

  constructor(private measureApi: MeasureApi) {}
}