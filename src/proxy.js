'use strict';

var http = require('http'),
    config, cache;

function onRequest(request, response) {
    cache.isCached(request.url, function(cached) {
        if (cached) {
            processCachedResponse(request.url, request, response);
        } else {
            processNewResponse(request.url, request, response);
        }
    });
}

function processCachedResponse(uri, request, response) {
    cache.getCachedUri(uri, function(data) {
        if (!data) {
            // something went wrong
            // proceed without cache
            processNewResponse(uri, request, response);
        } else {
            var headers = {};
            if (data.location) {
                headers.Location = data.location;
            }
            response.writeHead(data.status, headers);
            response.write(data.body);
            response.end();
        }
    })
}

function processNewResponse(uri, request, response) {
    // always forward favicon.ico
    if ('favicon.ico' === uri) {
        var location = getTargetUrl(uri);
        cache.cacheUri(uri, 302, location);
        response.writeHead(302, {
            Location: location
        });
        response.write('');
        response.end();
        return;
    }

    // make call to https backend
    var options = {
      hostname: config.targetHost,
      port: config.targetPort,
      path: uri,
      method: 'GET',
      headers: request.headers
    };
    var url = config.targetScheme + '://' + config.targetHost + ':' + config.targetPort + uri;
    console.log('requesting URL:', url);

    require('request')(url, function(error, res, body) {
        if (error) {
            console.log('error', error);
            return;
        } else {
            var location = null;
            if (200 === res.statusCode) {
                location = getTargetUrl(uri);
                cache.cacheUri(uri, 302, location);
                response.writeHead(302, {
                    Location: location
                });
                response.write('');
                response.end();
            } else {
                if (res.headers.hasOwnProperty('Location')) {
                    location = res.headers.Location;
                }
                cache.cacheUri(uri, res.statusCode, location, body);
                response.writeHead(res.statusCode, res.headers);
                response.write(body);
                response.end();
            }
        }
    });
}

function getTargetUrl(uri) {
    return config.targetScheme + '://' + config.targetHost + ':' + config.targetPort + uri;
}

function start(conf, _cache) {
    config = conf;
    cache = _cache;
    if (!config.port) {
        config.port = 8888;
    }

    if (!config.host) {
        config.host = '127.0.0.1';
    }

    http.createServer(onRequest).listen(config.port, config.host);
    console.log('Proxy started on http://' + config.host + ':' + config.port);
}

module.exports = {
    start: start
};
