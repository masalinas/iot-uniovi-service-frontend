import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/** import Swagger providers **/
import { HttpClientModule } from '@angular/common/http';

import { BASE_PATH } from './shared/sdk';

import { MeasureControllerService } from '../app/shared/sdk';

/** import angular environment variables **/
import { environment } from '../environments/environment';

import {FlexLayoutModule } from '@angular/flex-layout';
import {MaterialModule} from './material-module';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { RealtimeComponent } from './views/realtime.component';
import { HistoricComponent } from './views/historic.component';

import { MQTTService } from './services/mqtt.service';

@NgModule({
  declarations: [
    AppComponent,
    RealtimeComponent,
    HistoricComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [MQTTService,
    { provide: BASE_PATH, useValue: environment.basePath },
    MeasureControllerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
