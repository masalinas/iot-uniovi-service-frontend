import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl} from '@angular/forms';

import { Measure } from '../shared/sdk/models';
import { MeasureApi } from '../shared/sdk/services';

import * as moment from 'moment';

declare var vis:any;

@Component({
  selector: 'historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.css']
})
export class HistoricComponent implements OnInit {   
  title = 'Historic Graph';

  dateFrom = new FormControl(new Date());
  dateTo = new FormControl(new Date());

  @ViewChild("historicContainer") container: ElementRef;

  dataset = new vis.DataSet();  
  graph: any;

  public ngOnInit(): void {  
    // configure realtime graph
    const options = {
      scales: {
        xAxes: [{
            type: 'time',
            time: {
              unit: 'datetime',
              unitStepSize: 1,
              displayFormats: {
                'datetime': 'DD/MM/YYYY HH:mm:ss'
              }
            }
          }
        ]
      },
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
    console.log('dateFrom: ' + this.dateFrom.value);
    console.log('dateTo: ' + this.dateTo.value);

    //let now = moment();

    let filter: object = {where: {and: [{date: {gt: new Date(this.dateFrom.value)}}, 
                                        {date: {lt: new Date(this.dateTo.value)}}]}};

    this.measureApi.find(filter).subscribe((measures: Measure[]) => { 
      console.log('Measures: ' + measures);

      // clear graph dataset 
      this.dataset.clear();

      // fill graph dataset 
      measures.forEach((element, index) => {
        this.dataset.add({
          x: element.date,
          y: element.value,
          label: { content: element.value, yOffset: 15}
        })
      });     
    },
    error => {
      console.log(error);
    });
  }    

  constructor(private measureApi: MeasureApi) {}
}