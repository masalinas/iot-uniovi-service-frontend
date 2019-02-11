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
    private interval;
    data = [];
    device = {};

    subcribe: EventEmitter<String>;
    constructor(private zone: NgZone, private measureApi: MeasureApi, private mqttService: MQTTService) {
        this.subcribe = this.mqttService.onMqttMessageChanged.subscribe((message) => {
            // console debug
            // console.log(this.chart.data);
            const obj = JSON.parse(message);

            if (this.device[obj.device] === undefined) {
                this.device[obj.device] = true;
                let config = {};
                config = this.getConfig(obj.device);
                config['name'] = obj.device;
                this.createSeries(config);
            }
            const data = {
                date: new Date(),
                name: message
            };
            data[obj.device] = Number(obj.value);
            if (this.chart.data.length > 100) {
                this.chart.addData(data, 1);
            } else {
                this.chart.addData(data);
            }

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

        this.zone.runOutsideAngular(() => {
            this.chart = am4core.create(this.realtimeAmcharts.nativeElement, am4charts.XYChart);
            this.chart.legend = new am4charts.Legend();
            //this.chart.legend.useDefaultMarker = true;
            this.chart.zoomOutButton.disabled = true;
            this.chart.padding(10, 10, 10, 10);
            // data for examples
            /*
            let  visits = 0;
            for (let i = 1; i < 10; i++) {
                visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
                this.data.push({ date: new Date(2018, 0, i), name: 'name' + i, value: visits });
            }
            */
            // for (let i = 0; i <= 30; i++) {

            //     this.chart.data.push({ date: new Date().setSeconds(i - 30) });
            // }

            // ******** Axis X
            const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;
            // dateAxis.renderer.nonScaling = true;
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

            // ******* Axis Y
            const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            // valueAxis.interpolationDuration = 500;
            // valueAxis.rangeChangeDuration = 500;
            valueAxis.renderer.inside = true;
            valueAxis.renderer.minLabelPosition = 0.05;
            valueAxis.renderer.maxLabelPosition = 0.95;
            valueAxis.renderer.axisFills.template.disabled = true;
            valueAxis.renderer.ticks.template.disabled = true;
            valueAxis.title.text = 'Temmperature ºC';

            // Series

            /*
            series.dataFields.dateX = 'date';
            series.dataFields.valueY = 'value';
            series.tooltipText = '{valueY.value}';
            // series.tooltipText = '{Date}: [bold]{valueY}[/]';
            // series.cursorTooltipEnabled = true;
            // series.bullets.push(new am4charts.CircleBullet());
            series.interpolationDuration = 500;
            series.defaultState.transitionDuration = 0;
            series.tensionX = 0.8;
            */


            /*
            chart.events.on('datavalidated', function () {
                dateAxis.zoom({ start: 1 / 15, end: 1.2 }, false, true);
            });
            // add point circle for value
            const bullet = series.bullets.push(new am4charts.CircleBullet());
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
*/
            // chart.cursor = new am4charts.XYCursor();

            // const scrollbarX = new am4charts.XYChartScrollbar();
            // scrollbarX.series.push(series);
            // chart.scrollbarX = scrollbarX;

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
            let config = {}
            config = this.getConfig('init');
            config['visible'] = false;
            this.createSeries(config);

            this.startInterval();
        });
    }
    startInterval() {
        const series = this.chart;
        this.interval = setInterval(function () {
            const lastdataItem = series.dataItems.last;
            if (series.data.length > 100) {
                series.addData(
                    { date: new Date(lastdataItem.dataContext.date.getTime() + 1000) }, 1
                );
            } else {
                if (lastdataItem) {
                    if (lastdataItem.dataContext.date.getTime) {
                        series.addData(
                            { date: new Date(lastdataItem.dataContext.date.getTime() + 1000) }
                        );
                    } else {
                        series.addData(
                            { date: new Date(lastdataItem.dataContext.date + 1000) }
                        );
                    }
                } else {
                    series.addData(
                        { date: new Date() }
                    );
                }

            }
        }, 1000);
    }
    createSeries(config: any) {
        const series = this.chart.series.push(new am4charts.LineSeries());
        series.config = config;

    }
    getConfig(device) {
        const config = {
            dataFields: {
                dateX: 'date',
                valueY: 'value'
            },
           // legendSettings: {createMaker: false},
            tooltipText: '{valueY.value}',
            interpolationDuration: 500,
            tensionX: 0.9,
            bullets: [{
                type: 'Circle',
                tooltipText: '{valueY.value}',
                width: 5,
                height: 5
            },
            {
                type: 'LabelBullet',
                label: {
                    text: '{ alaue}',
                    dy: -20
                }
            }
            ],
            adapter: [
                {
                    type: 'fill',
                    callback: function (fill, target) {
                        if (!target.dataItem) {
                            return fill;
                        }
                        const values = target.dataItem.values;
                        return values.valueY.value >= 0
                            ? am4core.color('blue')
                            : am4core.color('red');
                    }
                }
            ]
        };
        switch (device) {
            case 'init':
                config.dataFields.valueY = '';
                config.bullets = [];
                config.adapter = [];
                config['legendSettings'] = {createMaker : false};
                break;
            case 'TP01':
                config.dataFields.valueY = device;
                // config
                break;
            case 'HM01':
                config.dataFields.valueY = device;
                config.bullets[0].type = 'Rectangle';
                // config
                break;
            default:
            // default config
        }
        return config;
    }
    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        clearInterval(this.interval);
        this.zone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }
}
