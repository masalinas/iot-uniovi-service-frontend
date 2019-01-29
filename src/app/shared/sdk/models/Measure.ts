/* tslint:disable */

declare var Object: any;
export interface MeasureInterface {
  "date": Date;
  "value": number;
  "device": string;
  "id"?: any;
}

export class Measure implements MeasureInterface {
  "date": Date;
  "value": number;
  "device": string;
  "id": any;
  constructor(data?: MeasureInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Measure`.
   */
  public static getModelName() {
    return "Measure";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Measure for dynamic purposes.
  **/
  public static factory(data: MeasureInterface): Measure{
    return new Measure(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'Measure',
      plural: 'Measures',
      path: 'Measures',
      idName: 'id',
      properties: {
        "date": {
          name: 'date',
          type: 'Date'
        },
        "value": {
          name: 'value',
          type: 'number'
        },
        "device": {
          name: 'device',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
