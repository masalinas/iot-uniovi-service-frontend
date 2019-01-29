import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { BASE_URL, API_VERSION } from './shared/sdk/base.url';
import { LoopBackConfig, LoggerService } from './shared/sdk/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {   
  title = 'IoT Uniovi Dashboard';

  constructor() {
    // Configure LoopBack Once or Individually by Component
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);
  }
}
