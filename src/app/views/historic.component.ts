import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import {FormControl} from '@angular/forms';

import { Measure } from '../shared/sdk/models';
import { MeasureApi } from '../shared/sdk/services';

import {MatSnackBar, DateAdapter} from '@angular/material';

import * as moment from 'moment';

declare var vis:any;

@Component({
  selector: 'historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.css']
})
export class HistoricComponent implements OnInit {   
  // initualize class attributes
  title = 'Historic Graph';
  
  dateFrom = new FormControl(moment().startOf('day').toDate());
  dateTo = new FormControl(moment().endOf('day').toDate());
  device = '*';

  @ViewChild("historicContainer") container: ElementRef;

  groups = new vis.DataSet();
  dataset = new vis.DataSet();  
  graph: any;

  getGraphOption(id, name, color) {
    return {
      id: id,
      content: name,
      drawPoints: function(id, item, group) {
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
  }

  onLoad(event: any) {      
    console.log('dateFrom: ' + this.dateFrom.value);
    console.log('dateTo: ' + this.dateTo.value);

    let filter: object;
    if (this.device != '*')
      filter = {where: {and: [{date: {gt: new Date(this.dateFrom.value)}}, 
                              {date: {lt: new Date(this.dateTo.value)}}]}};
    else
      filter = {where: {and: [{device: this.device},
                              {date: {gt: new Date(this.dateFrom.value)}}, 
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

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.graph.options.height = Math.round( window.innerHeight * 0.70) + 'px';
    this.graph.options.graphHeight = this.graph.options.height;
  }

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

    // resize the graph to expand
    //this.getScreenSize();
  }

  constructor(private measureApi: MeasureApi, private snackBar: MatSnackBar, private dateAdapter: DateAdapter<Date>) {
    // set locale settings
    this.dateAdapter.setLocale('es'); 
  }
}