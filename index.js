'use strict';
var proxy = require('./src/proxy');

proxy.start(require('./config.json'), require('./src/memoryCache'));
