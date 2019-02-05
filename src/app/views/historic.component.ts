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
  // initialize class attributes
  title = 'Historic Graph';
  
  dateFrom = new FormControl(moment().startOf('day').toDate());
  dateTo = new FormControl(moment().endOf('day').toDate());
  devices = [{name: '*', description: 'All'}, 
             {name: 'TP01', description: 'Temperature'},
             {name: 'RH01', description: 'Humidity'}];
  ALL = '*';
  selectedDevice;

  @ViewChild("historicContainer") container: ElementRef;

  groups = new vis.DataSet();
  dataset = new vis.DataSet();  
  graph: any;

  getGraphData(id, name, measures, data) {
    var option = {
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

    this.groups.add(option);

    measures.forEach(function(measure) {       
      data.push({
        group: id,
        x: measure.date,
        y: measure.value,
        label: { content: measure.value, yOffset: 15}
      });
    });
  }

  onLoad(event: any) {    
    // get firts and last date from filter  
    let from =  new FormControl(moment(this.dateFrom.value).startOf('day').toDate());
    let to =  new FormControl(moment(this.dateTo.value).endOf('day').toDate());

    console.log('dateFrom: ' + from);
    console.log('dateTo: ' + to);

    let filter: object;
    if (this.selectedDevice == this.ALL)
      filter = {where: {and: [{date: {gt: from.value}}, 
                              {date: {lt: to.value}}]}};
    else
      filter = {where: {and: [{device: this.selectedDevice.name},
                              {date: {gt: new Date(from.value)}}, 
                              {date: {lt: new Date(to.value)}}]}};

    this.measureApi.find(filter).subscribe((measures: Measure[]) => { 
      console.log('Measures: ' + measures);

      // fill graph dataset
      let deviceMeasures;
      let count = 1;
      this.groups.clear()
      let data = [];      
      if (this.selectedDevice == this.ALL) {
        this.devices.forEach((device) => {
          deviceMeasures = measures.filter(measure => measure.device === device.name);

          if (deviceMeasures.length > 0)
            this.getGraphData(count, device.description, deviceMeasures, data);

          count++;
        })
      } else {
        deviceMeasures = measures.filter(measure => measure.device === this.selectedDevice);

        if (deviceMeasures.length > 0)
            this.getGraphData(1, this.selectedDevice, deviceMeasures, data);

          count++;
      }

      // fill graph dataset
      /*measures.forEach((element, index) => {
        data.push({
          x: element.date,
          y: element.value,
          label: { content: element.value, yOffset: 15}
        });
      });*/ 

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
    // initialize device collection
    this.selectedDevice = '*';

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