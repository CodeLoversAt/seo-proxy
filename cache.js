'use strict';

var cache = {},
    limit = 86400;

function isCached(uri) {
    if (!cache.hasOwnProperty(uri)) {
        return false;
    }

    var now = (new Date()).getTime();
    if ((cache[uri].timestamp - now) > limit) {
        deleteCachedUri(uri);
        return false;
    }

    return true;
}

function deleteCachedUri(uri) {
    if (cache.hasOwnProperty(uri)) {
        delete cache[uri];
    }
}

function cacheUri(uri, statusCode, location, body) {
    cache[uri] = {
        status: statusCode,
        location: location || '',
        timestamp: (new Date()).getTime(),
        body: body || ''
    };
}

function getCachedUri(uri) {
    if (cache.hasOwnProperty(uri)) {
        return cache[uri];
    }

    return null;
}

function ensureCallback(cb) {
    if (!cb || 'function' !== typeof cb) {
        return function() {};
    }

    return cb;
}

module.exports = {
    isCached: function(uri, cb) {
        ensureCallback(cb)(isCached(uri));
    },
    deleteCachedUri: function(uri, cb) {
        deleteCachedUri(uri);
        ensureCallback(cb)();
    },
    cacheUri: function(uri, statusCode, location, body, cb) {
        cacheUri(uri, statusCode, location, body);
        ensureCallback(cb)();
    },
    getCachedUri: function(uri, cb) {
        ensureCallback(cb)(getCachedUri(uri));
    }
};
