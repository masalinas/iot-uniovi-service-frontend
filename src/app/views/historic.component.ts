import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Measure } from '../shared/sdk/models';
import { MeasureApi } from '../shared/sdk/services';

import { MatSnackBar, DateAdapter } from '@angular/material';

import * as moment from 'moment';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

declare var vis: any;

@Component({
  selector: 'app-historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.css']
})
export class HistoricComponent implements OnInit, AfterViewInit {
  // initialize class attributes
  title = 'Historic Graph';

  dateFrom = new FormControl(moment().startOf('day').toDate());
  dateTo = new FormControl(moment().endOf('day').toDate());
  devices = [{ name: '*', description: 'All' },
  { name: 'TP01', description: 'Temperature' },
  { name: 'RH01', description: 'Humidity' }];
  ALL = '*';
  selectedDevice;
  private chart: am4charts.XYChart;
  data = [];
  private device = {};
  private deviceUnit = [];

  @ViewChild('historicContainer') historicContainer: ElementRef;


  constructor(private zone: NgZone, private measureApi: MeasureApi
    , private snackBar: MatSnackBar, private dateAdapter: DateAdapter<Date>) {
    // set locale settings
    this.dateAdapter.setLocale('es');
  }
  /**
    * Implementations for after load html
    */
  ngAfterViewInit() {

    this.zone.runOutsideAngular(() => {
      this.chart = am4core.create(this.historicContainer.nativeElement, am4charts.XYChart);
      this.chart.colors.step = 5;
      this.chart.legend = new am4charts.Legend();
      this.chart.cursor = new am4charts.XYCursor();
      this.createDateAxis();
    });
  }

  onLoad(event: any) {
    // get firts and last date from filter
    const from = new FormControl(moment(this.dateFrom.value).startOf('day').toDate());
    const to = new FormControl(moment(this.dateTo.value).endOf('day').toDate());

    let filter: object;
    if (this.selectedDevice === this.ALL) {
      filter = {
        where: {
          and: [{ date: { gt: from.value } },
          { date: { lt: to.value } }]
        }
      };
     } else {
      filter = {
        where: {
          and: [{ device: this.selectedDevice.name },
          { date: { gt: new Date(from.value) } },
          { date: { lt: new Date(to.value) } }]
        }
      };
    }
    this.device = {};
    this.deviceUnit = [];
    this.chart.data = [];
    this.chart.series.each((series) => {
        series.yAxis.removeChildren();
    });
    this.chart.series.clear();
    const scrollbarX = new am4charts.XYChartScrollbar();
    this.measureApi.find(filter).subscribe((measures: Measure[]) => {
       measures.forEach((message) => {
          if (this.device[message.device] === undefined ) {
              this.device[message.device] = true;
              let config = {};
              config = this.getConfig(message.device);
              config['name'] = message.device;
              const title_axis = this.getDeviceUnit(message.device);
              const series = this.createSeries(config, title_axis);
              scrollbarX.series.push(series);
          }
          const data = {
            date: new Date(message.date),
            name: message.device
          };
          data[message.device] = message.value;
          this.chart.addData(data);
        });
        this.chart.scrollbarX = scrollbarX;
      this.snackBar.open('The historize was loaded!', 'Ok', {
        duration: 2000,
      });

    },
      error => {
        this.snackBar.open('ERROR: The historize load failed!', 'Ok', {
          duration: 2000,
        });
        console.log(error);
      });
  }

   /**
   * Create series in chart from config
   * @param config
   */
  createSeries(config: any, title_axis) {
    const series = new am4charts.LineSeries();
    // const bullet = series.bullets.push(new am4charts.CircleBullet());
    series.config = config;
    const deviceUnit = this.deviceUnit.indexOf(title_axis);
    if (deviceUnit === -1) {
      this.deviceUnit.push(title_axis);
      const valueAxis = this.createValueAxis(title_axis);
      series.yAxis = valueAxis;
    }
    this.chart.series.push(series);
    return series;
  }
  /**
   * Create axis in coord X
   */
  createDateAxis() {

    // ******** Axis X
    const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
  }
  /**
   * Create axis in coord Y
   */
  createValueAxis(title: string) {
    // ******* Axis Y
    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = title;
    return valueAxis;
  }
  /**
   * config series from device
   * @param device
   */
  getConfig(device) {
    const config = {
      name: device,
      dataFields: {
        dateX: 'date',
        valueY: 'value'
      },
      tooltipText: '{valueY.value}',
      interpolationDuration: 500,
      tensionX: 0.9,
      bullets: []
    };
    switch (device) {
      case 'init':
        config.dataFields.valueY = '';
        break;
      case 'TP01':
        config.dataFields.valueY = device;
        config.bullets = [{
          type: 'CircleBullet',
          circle: {
            radius: 5,
            stroke: '#fff',
            strokeWidth: 3
          }
        }
        ];
        break;
      case 'RH01':
        config.dataFields.valueY = device;
        config.bullets = [{
          type: 'Bullet',
          children: [{
              type: 'Rectangle',
              width: 10,
              height: 10,
              horizontalCenter: 'middle',
              verticalCenter: 'middle',
              stroke: '#fff',
              strokeWidth: 2
          }]
        }
        ];
        break;
      default:
      // default config
    }
    return config;
  }
  /**
   * Methods mock fake device unit
   * @param device
   */
  getDeviceUnit(device) {
    let unit = '';
    switch (device) {
      case 'init':
        unit = 'init';
        break;
      case 'TP01':
        unit = 'Temperature ℃';
        break;
      case 'RH01':
        unit = 'Humidity %';
        break;
      default:
      // default config
    }
    return unit;
  }

  public ngOnInit(): void {
    // initialize device collection
    this.selectedDevice = '*';

    // graph configuration
    const options = {
      drawPoints: function (item, group) {
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
        left: {
          title: {
            text: 'Temperature [℃]'
          }
        }
      }
    };

    let container = this.container.nativeElement;
    this.graph = new vis.Graph2d(container, this.dataset, options);

    // resize the graph to expand
    //this.getScreenSize();
  }


}
