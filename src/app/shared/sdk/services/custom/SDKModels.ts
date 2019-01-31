/* tslint:disable */
import { Injectable } from '@angular/core';
import { Measure } from '../../models/Measure';
import { Configuration } from '../../models/Configuration';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    Measure: Measure,
    Configuration: Configuration,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
