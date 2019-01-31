/* tslint:disable */

declare var Object: any;
export interface ConfigurationInterface {
  "key": string;
  "value": any;
  "id"?: any;
}

export class Configuration implements ConfigurationInterface {
  "key": string;
  "value": any;
  "id": any;
  constructor(data?: ConfigurationInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Configuration`.
   */
  public static getModelName() {
    return "Configuration";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Configuration for dynamic purposes.
  **/
  public static factory(data: ConfigurationInterface): Configuration{
    return new Configuration(data);
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
      name: 'Configuration',
      plural: 'Configurations',
      path: 'Configurations',
      idName: 'id',
      properties: {
        "key": {
          name: 'key',
          type: 'string'
        },
        "value": {
          name: 'value',
          type: 'any'
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
