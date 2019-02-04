/** import Angular App Modules **/
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

/** import loopback module **/
import { SDKBrowserModule } from './shared/sdk/index';

/** import UI and material UX modules **/
import {FlexLayoutModule } from '@angular/flex-layout';
import {MaterialModule} from './material-module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

/** import App components **/
import { AppComponent } from './app.component';
import { RealtimeComponent } from './views/realtime.component';
import { HistoricComponent } from './views/historic.component';
import {AmchartsHistoricComponent} from './views/amcharts/amcharts-historic.component';
import {AmchartsRealTimeComponent} from './views/amcharts/amcharts-realtime.component';
import {MqttComponent} from './mqtt/mqtt.component';
/** import App services **/
import { MQTTService } from './services/mqtt.service';

@NgModule({
  declarations: [
    AppComponent,
    RealtimeComponent,
    HistoricComponent,
    AmchartsHistoricComponent,
    AmchartsRealTimeComponent,
    MqttComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SDKBrowserModule.forRoot()
  ],
  providers: [MQTTService],
  bootstrap: [AppComponent]
})
export class AppModule { }
