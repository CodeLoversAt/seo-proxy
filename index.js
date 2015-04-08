'use strict';
var proxy = require('./proxy');

proxy.start(require('./config.json'), require('./cache'));
