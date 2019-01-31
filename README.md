# Iot Uniovi Dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng serve --host <IP>` for a dev server in <IP>

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## add script to avoid global error
`<!-- https://github.com/aws/aws-amplify/issues/678 fix: -->`
`<script>`
`  if (global === undefined) {`
`    var global = window;`
`  }`
`</script>`
`<!-- https://github.com/aws/aws-amplify/issues/678 fix end-->`

## To change IP connection in Dashboard
* Set Paho MQTT IP client on mqtt.service.ts
* Set Loopback IP Services on environment.ts for devel or environment.prod.ts for production envirotment

