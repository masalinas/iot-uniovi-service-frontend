import { Component, OnInit, ViewChild, ElementRef, EventEmitter, AfterViewInit, NgZone } from '@angular/core';

import { MQTTService } from '../services/mqtt.service';
import { Configuration } from '../shared/sdk/models';
import { ConfigurationApi } from '../shared/sdk/services';

import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

const KEY = 'FREQUENCY';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit, AfterViewInit {
  title = 'Realtime Graph';

  @ViewChild('realTimeContainer') realTimeContainer: ElementRef;
  private chart: am4charts.XYChart;
  private interval;
  data = [];
  device = {};
  dataInterval = [];
  private seriesInit: am4charts.LineSeries;
  frequency = new FormControl(10);
  onMqttMessageChangedEventHandler: EventEmitter<String>;

  constructor(
    private zone: NgZone, 
    private mqttService: MQTTService,
    private configurationApi: ConfigurationApi, 
    private snackBar: MatSnackBar) {
      this.onMqttMessageChangedEventHandler = this.mqttService.onMqttMessageChanged.subscribe((message) => {
        const obj = JSON.parse(message);

        if (this.device[obj.device] === undefined) {
          this.device[obj.device] = true;

          let config = this.getConfig(obj.device);
          config['name'] = obj.device;
          
          const title_axis = this.getDeviceUnit(obj.device);        
          this.createSeries(config, title_axis);

          // remove init series from load first data from mqtt message
          if (this.seriesInit !== undefined) {
            this.chart.series.getIndex(this.chart.series.indexOf(this.seriesInit)).yAxis.removeChildren();
            this.chart.series.removeIndex(this.chart.series.indexOf(this.seriesInit)).dispose();
            this.seriesInit = undefined;
          }
        }

        const data = {
          date: new Date(),
          name: message
        };

        data[obj.device] = Number(obj.value);

        if (this.chart.data.length > 90)
          this.chart.addData(data, 1);
        else 
          this.chart.addData(data);      
    });
  }

  public ngOnInit(): void {
    this.configurationApi.getByKey(KEY).subscribe((configuration: Configuration) => {
      this.frequency.setValue(configuration.value);
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  /**
    * Implementations for after load html
    */
  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.chart = am4core.create(this.realTimeContainer.nativeElement, am4charts.XYChart);
      this.chart.colors.step = 5;
      this.chart.legend = new am4charts.Legend();
      this.chart.zoomOutButton.disabled = true;

      let config = this.getConfig('init');

      this.createDateAxis();
      this.seriesInit = this.createSeries(config, 'init');
      this.startInterval();
    });
  }

  public getFrequencyLength(): string {
    return this.frequency.value.toString().length;
  }

  onSaveFrequency(event: any) {
    this.configurationApi.updateKey(KEY, this.frequency.value).subscribe((configuration: Configuration) => {
      console.log('Frecuency: ' + this.frequency.value.toString().length);

      this.snackBar.open('The configuration was saved!', 'Ok', {
        duration: 3000,
      });
    });
  }

  /**
   * Begin interval one 1 seconds and add date
   */
  startInterval() {
    const series = this.chart;
    const dataInterval = this.dataInterval;
    this.interval = setInterval(function () {
      // const lastdataItem: am4core.DataItem = series.dataItems.last;
      const lastdat = series.dataItems.getIndex(series.dataItems.length - 1);
      const lastdataItem = series.data[series.data.length - 1];
      if (dataInterval.length > 60) {
        dataInterval.splice(60, 1);
        series.addData(
          { date: new Date(lastdataItem.date.getTime() + 1000) }, 1);
      } else {
        if (lastdataItem) {
          series.addData(
            { date: new Date(lastdataItem.date.getTime() + 1000) }
          );
        } else {
          series.addData(
            { date: new Date() }
          );
        }
      }
      dataInterval.push('');
    }, 1000);
  }
  
  /**
   * Create series in chart from config
   */
  createSeries(config: any, title_axis) {
    const valueAxis = this.createValueAxis(title_axis);
    const series = new am4charts.LineSeries();
    
    series.config = config;
    series.yAxis = valueAxis;
    
    this.chart.series.push(series);

    return series;
  }

  /**
   * Create axis in coord X
   */
  createDateAxis() {
    const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());

    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 25;
    dateAxis.baseInterval = { timeUnit: 'second', count: 1 };
    dateAxis.dateFormats.setKey('second', 'ss');
    dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
    dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
    dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
    dateAxis.renderer.inside = true;
    dateAxis.renderer.axisFills.template.disabled = true;
    dateAxis.renderer.ticks.template.disabled = true;
    dateAxis.interpolationDuration = 500;
    dateAxis.rangeChangeDuration = 500;
    // dateAxis.markUnitChange = false;

    // this makes date axis labels which are at equal minutes to be rotated
    dateAxis.renderer.labels.template.adapter.add('rotation', function (rotation, target) {
      const dataItem = target.dataItem;
      if (dataItem['date'].getSeconds() === 0) {
        target.verticalCenter = 'middle';
        target.horizontalCenter = 'left';

        return -90;
      } else {
        target.verticalCenter = 'bottom';
        target.horizontalCenter = 'middle';

        return 0;
      }
    });
  }

  /**
   * Create axis in coord Y
   */
  createValueAxis(title: string) {
    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.axisFills.template.disabled = true;
    valueAxis.renderer.ticks.template.disabled = true;
    valueAxis.title.text = title;

    return valueAxis;
  }

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
        },
        {
          type: 'LabelBullet',
          label: {
            text: '{valueY.value}',
            dy: -20
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
        },
        {
          type: 'LabelBullet',
          label: {
            text: '{valueY.value}',
            dy: -20
          }
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
}