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
            // console.log(this.chart.data);
            let obj = JSON.parse(message);
            this.chart.addData({
                date: new Date(),
                value: Number(obj.value),
                name: message
            });
            /*
            this.chart.data.push({
                date: new Date(),
                value: Number(message),
                name: message
            });
            this.chart.validateData();
            */
        });
    }

    ngAfterViewInit() {


        const chart = am4core.create(this.realtimeAmcharts.nativeElement, am4charts.XYChart);
        chart.zoomOutButton.disabled = true;
        chart.paddingRight = 20;
        // data for examples
        /*
        let  visits = 0;
        for (let i = 1; i < 10; i++) {
            visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            this.data.push({ date: new Date(2018, 0, i), name: 'name' + i, value: visits });
        }
        */
        for (let i = 0; i <= 30; i++) {

            this.data.push({ date: new Date().setSeconds(i - 30) });
        }
        chart.data = this.data;

        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        //dateAxis.renderer.nonScaling = true;
        dateAxis.renderer.minGridDistance = 25;
        dateAxis.baseInterval = { timeUnit: 'second', count: 1 };
        dateAxis.dateFormats.setKey('second', 'ss');
        dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
        dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
        dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
        dateAxis.renderer.inside = true;
        dateAxis.renderer.axisFills.template.disabled = true;
        dateAxis.renderer.ticks.template.disabled = true;
        //dateAxis.markUnitChange = false;

        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        //valueAxis.interpolationDuration = 500;
        //valueAxis.rangeChangeDuration = 500;
        valueAxis.renderer.inside = true;
        valueAxis.renderer.minLabelPosition = 0.05;
        valueAxis.renderer.maxLabelPosition = 0.95;
        valueAxis.renderer.axisFills.template.disabled = true;
        valueAxis.renderer.ticks.template.disabled = true;
        valueAxis.title.text = 'Temmperature ºC';


        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = 'date';
        series.dataFields.valueY = 'value';
        series.tooltipText = '{valueY.value}';
        // series.tooltipText = '{Date}: [bold]{valueY}[/]';
        // series.cursorTooltipEnabled = true;
        // series.bullets.push(new am4charts.CircleBullet());
        series.interpolationDuration = 500;
        series.defaultState.transitionDuration = 0;
        series.tensionX = 0.8;

        dateAxis.interpolationDuration = 500;
        dateAxis.rangeChangeDuration = 500;

        chart.events.on('datavalidated', function () {
            dateAxis.zoom({ start: 1 / 15, end: 1.2 }, false, true);
        });

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

        // const scrollbarX = new am4charts.XYChartScrollbar();
        // scrollbarX.series.push(series);
        // chart.scrollbarX = scrollbarX;

        // this makes date axis labels which are at equal minutes to be rotated
        /*dateAxis.renderer.labels.template.adapter.add("rotation", function (rotation, target) {
            var dataItem = target.dataItem;
            if (dataItem.date.getTime() == am4core.time.round(new Date(dataItem.date.getTime()), "minute").getTime()) {

                target.verticalCenter = "middle";
                target.horizontalCenter = "left";
                return -90;
            }
            else {
                target.verticalCenter = "bottom";
                target.horizontalCenter = "middle";
                return 0;
            }
        })*/

        this.chart = chart;
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (interval) {
                    clearInterval(interval);
                }
            } else {
                startInterval();
            }
        }, false);
        // add data
        let interval;
        function startInterval() {
            interval = setInterval(function () {
                const lastdataItem = series.dataItems.getIndex(series.dataItems.length - 1);
                chart.addData(
                    { date: new Date(lastdataItem.dateX.getTime() + 1000) },
                    1
                );
            }, 1000);
        }
        startInterval();
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
