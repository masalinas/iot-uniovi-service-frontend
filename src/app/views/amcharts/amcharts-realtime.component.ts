import { Component, NgZone, AfterViewInit, OnInit, OnChanges, AfterContentInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Measure } from '../../shared/sdk/models';
import { MeasureApi } from '../../shared/sdk/services';
import { FormControl } from '@angular/forms';
import { MQTTService } from '../../services/mqtt.service';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-amcharts-realtime',
    // template: `<div id="chartdiv" #amchartsContainer style="width: 100%; height: 500px"></div>`,
    templateUrl: './amcharts-realtime.component.html',
    styleUrls: ['./amcharts-realtime.component.css']
})

export class AmchartsRealTimeComponent implements AfterViewInit {

    private chart: am4charts.XYChart;
    @ViewChild('realtimeAmcharts') realtimeAmcharts: ElementRef;

    data = [];

    subcribe: EventEmitter<String>;
    constructor(private zone: NgZone, private measureApi: MeasureApi, private mqttService: MQTTService) {
        this.subcribe = this.mqttService.onMqttMessageChanged.subscribe((message) => {
            // console debug
            /*
            console.log(this.chart.data);
            this.chart.addData({
                date: new Date(),
                value: Number(message),
                name: message
            });
            */
            this.chart.data.push({
                date: new Date(),
                value: Number(message),
                name: message
            });
            this.chart.validateData();
        });
    }

    ngAfterViewInit() {


        const chart = am4core.create(this.realtimeAmcharts.nativeElement, am4charts.XYChart);

        chart.paddingRight = 20;
        // data for examples
        /*
        let  visits = 0;
        for (let i = 1; i < 10; i++) {
            visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            this.data.push({ date: new Date(2018, 0, i), name: 'name' + i, value: visits });
        }
        */
        chart.data = this.data;

        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.grid.template.location = 0;
        valueAxis.title.text = 'Temmperature ºC';


        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = 'date';
        series.dataFields.valueY = 'value';
        series.tooltipText = '{valueY.value}';
        // series.tooltipText = '{Date}: [bold]{valueY}[/]';
        // series.cursorTooltipEnabled = true;
        // series.bullets.push(new am4charts.CircleBullet());
        series.tensionX = 0.93;

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

    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }
}
