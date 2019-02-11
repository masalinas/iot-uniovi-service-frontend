import { Component, NgZone, AfterViewInit, OnInit, OnChanges, AfterContentInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Measure } from '../../shared/sdk/models';
import { MeasureApi } from '../../shared/sdk/services';
import { FormControl } from '@angular/forms';
import { MQTTService } from '../../services/mqtt.service';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import * as moment from 'moment';
import {MatSnackBar, DateAdapter} from '@angular/material';
am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-amcharts-historic',
    // template: `<div id="chartdiv" #amchartsContainer style="width: 100%; height: 500px"></div>`,
    templateUrl: './amcharts-historic.component.html',
    styleUrls: ['./amcharts-historic.component.css']
})

export class AmchartsHistoricComponent implements AfterViewInit {

    private chart: am4charts.XYChart;
    dateFrom = new FormControl(moment().startOf('day').toDate());
    dateTo = new FormControl(moment().endOf('day').toDate());
    devices = [{ name: '*', description: 'All' },
    { name: 'TP01', description: 'Temperature' },
    { name: 'RH01', description: 'Humidity' }];
    ALL = '*';
    selectedDevice;
    @ViewChild('historicAmcharts') historicAmcharts: ElementRef;

    data = [];
    subcribe = any;
 
    constructor(private zone: NgZone, private measureApi: MeasureApi, private mqttService: MQTTService, private dateAdapter: DateAdapter<Date>) {
        // set locale settings
        this.dateAdapter.setLocale('es');
    }

    ngAfterViewInit() {

        this.zone.runOutsideAngular(() => {

            const chart = am4core.create(this.historicAmcharts.nativeElement, am4charts.XYChart);

            chart.paddingRight = 20;


            // data for examples
            /*
            for (let i = 1; i < 366; i++) {
                visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
                this.data.push({ date: new Date(2018, 0, i), name: 'name' + i, value: visits });
            }
            */

            chart.data = this.data;

            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            // valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 35;
            valueAxis.title.text = 'Temmperature ºC';

            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = 'date';
            series.dataFields.valueY = 'value';
            series.tooltipText = '{valueY.value}';
            // add point circle for value
            const bullet = series.bullets.push(new am4charts.CircleBullet());
            // const circle = bullet.createChild(am4core.Circle);
            bullet.tooltipText = '{valueY.value}';

            bullet.adapter.add('fill', function (fill, target) {
                if (!target.dataItem) {
                    return fill;
                }
                const values = target.dataItem.values;
                return values.valueY.value >= 0
                    ? am4core.color('blue')
                    : am4core.color('red');
            });

            bullet.width = 5;
            bullet.height = 5;
            const labelBullet = series.bullets.push(new am4charts.LabelBullet());
            labelBullet.label.text = '{value}';
            labelBullet.label.dy = -20;
            // range other colors negative value
            const range = valueAxis.createSeriesRange(series);
            range.value = 0;
            range.endValue = -100;
            range.contents.stroke = am4core.color('red');

            // chart.cursor = new am4charts.XYCursor();

            const scrollbarX = new am4charts.XYChartScrollbar();
            scrollbarX.series.push(series);
            chart.scrollbarX = scrollbarX;

            this.chart = chart;
        });
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

    onLoad(event: any) {

        const filter: object = {
            where: {
                and: [{ date: { gt: new Date(this.dateFrom.value) } },
                { date: { lt: new Date(this.dateTo.value) } }]
            }
        };

        this.measureApi.find(filter).subscribe((measures: Measure[]) => {

            // clear graph dataset
            this.chart.data = [];

            // fill graph dataset
            measures.forEach((element, index) => {
                this.chart.data.push({
                    date: new Date(element.date),
                    value: element.value,
                    name: element.device
                });
            });
            this.chart.validateData();
        },
            error => {
                console.log(error);
            });
    }
}
