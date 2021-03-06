# wsoop
[![npm version](https://badge.fury.io/js/wsoop.svg)](https://badge.fury.io/js/wsoop) [![dependencies Status](https://david-dm.org/ibrahimduran/wsoop/status.svg)](https://david-dm.org/ibrahimduran/wsoop) [![devDependencies Status](https://david-dm.org/ibrahimduran/wsoop/dev-status.svg)](https://david-dm.org/ibrahimduran/wsoop?type=dev) [![Travis](https://img.shields.io/travis/ibrahimduran/wsoop.svg)](https://travis-ci.org/ibrahimduran/wsoop) [![Coverage Status](https://coveralls.io/repos/github/ibrahimduran/wsoop/badge.svg?branch=master)](https://coveralls.io/github/ibrahimduran/wsoop?branch=master)

Framework for developing efficient WebSocket server applications.

## Installation

`$ npm install --save wsoop`

## Usage (< ES2015)

Create applicaton using the Server class.
```js
var wsoop = require('wsoop');
var app = new wsoop.Server();

...

app.listen(5000);
```

Add actions (routes) to the application.
```js
var myAction = new wsoop.Action()
  .add('hello', () => {
    // world!
  });

app.add(myAction);
```

## Usage (>= ES2015)
You can directly import `Server` and `Action` class from wsoop package.
```js
import { Server, Action } from 'wsoop';
```

### Class and Decorators
You can use ES2015 classes and decorators to define actions.
```js
import { bind } from 'wsoop';

class MyAction {
  @bind('message')
  onMessage() {
    //
    // New message from socket
    // TODO: do some stuff here
    //
  }
}
```
More examples will be available soon...

## Verbose
You can set environment variable to display verbose log messages.
```sh
$ DEBUG=ws:* node myApp.js
```

## License
MIT
