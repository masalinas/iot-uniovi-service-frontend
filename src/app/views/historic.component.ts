import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl} from '@angular/forms';

import { Measure } from '../shared/sdk/models';
import { MeasureApi } from '../shared/sdk/services';

import {MatSnackBar} from '@angular/material';

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
    // graph configuration
    const options = {
      drawPoints: function(item, group) {
        // set item style
        group.style = 'circle';

        // round value
        item.y = Math.round(item.y * 100) / 100;
        item.orginalY = item.y;
        item.label.content = item.y;

        return item;
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

    let filter: object = {where: {and: [{date: {gt: new Date(this.dateFrom.value)}}, 
                                        {date: {lt: new Date(this.dateTo.value)}}]}};

    this.measureApi.find(filter).subscribe((measures: Measure[]) => { 
      console.log('Measures: ' + measures);

      // fill graph dataset
      let data = [];
      measures.forEach((element, index) => {
        data.push({
          x: element.date,
          y: element.value,
          label: { content: element.value, yOffset: 15}
        });
      }); 

      // set graph dataset
      this.graph.setItems(data);

      // fit graph from dataset
      this.graph.fit();

      this.snackBar.open('The historize was loaded!', 'Ok', {
        duration: 2000,
      });
    },
    error => {
      console.log(error);
    });
  }    

  constructor(private measureApi: MeasureApi, private snackBar: MatSnackBar) {}
}