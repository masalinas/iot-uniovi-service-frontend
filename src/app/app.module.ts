import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [MQTTService],
  bootstrap: [AppComponent]
})
export class AppModule { }
