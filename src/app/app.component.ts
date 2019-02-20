import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { AppConfigurator } from './shared/app.configurator';
import { LoopBackConfig, LoggerService } from './shared/sdk/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'IoT Uniovi Dashboard';

  constructor() {
    const baseUrl = AppConfigurator.getApiProtocol() + '//' + AppConfigurator.getApiHostname() + ':' + AppConfigurator.getApiPort();
    const apiVersion = AppConfigurator.getApiVersion();

    // Configure LoopBack Once or Individually by Component
    LoopBackConfig.setBaseURL(baseUrl);
    LoopBackConfig.setApiVersion(apiVersion);
  }
}
