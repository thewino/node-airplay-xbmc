/**
 * node-airplay
 * 
 * @file airplay device
 * @author zfkun(zfkun@msn.com)
 * @thanks https://github.com/benvanik/node-airplay/blob/master/lib/airplay/device.js
 */

var events = require( 'events' );
var util = require( 'util' );
var plist = require( 'plist' );

var Client = require( './client' ).Client;



function Device ( id, info, callback ) {
    var self = this;

    events.EventEmitter.call( this );

    this.id = id;
    this.info = info;
    // this.serverInfo = null;

    this.client = new Client(
        {
            host: info.host, port: info.port
            // ,user: 'zfkun', pass: ''
        },
        function () {
            self.client.serverInfo(function( info ) {
                self.serverInfo = info;
                self.onReady( callback );
            });
        }
    );
}

util.inherits( Device, events.EventEmitter );
exports.Device = Device;


Device.prototype.onReady = function ( callback ) {
    this.ready = !0;

    if ( callback ) {
        callback( this );
    }

    this.emit( 'ready', this );
};

Device.prototype.isReady = function () {
  return !!this.ready;
};

Device.prototype.close = function() {
    if ( this.client ) {
        this.client.close();
    }

    this.client = null;
    this.ready = !1;

    this.emit( 'close', this );
};

Device.prototype.match = function ( info ) {
    for ( var key in info ) {
        if ( this.info[ key ] != info[ key ] ) {
            return !1;
        }
    }
    return !0;
};

Device.prototype.getInfo = function() {
    var info = this.info;
    var serverInfo = this.serverInfo;

    return {
        id: this.id,
        name: info.serviceName,
        deviceId: info.host,
        features: serverInfo.features,
        model: serverInfo.model,

        slideshowFeatures: [],
        supportedContentTypes: []
    };
};


// extend airplay apis: 'localName[:clientName]'
[
    'status:playbackInfo', 'authorize',
    'play', 'stop', 'scrub', 'reverse', 'rate', 'volume',
    'photo'
].forEach(function ( api ) {
    api = api.split( ':' );
    api[1] = api[1] || api[0];

    Device.prototype[ api[0] ] = function() {
        this.client[ api[1] ].apply( this.client, arguments );
    };
});
