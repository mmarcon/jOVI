/*
 * Copyright (c) 2011 Massimiliano Marcon, http://marcon.me
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {
    var JOVI = 'jovi',
        MQUEUE = 'jovi-mqueue',
        _mapsAPI = null,
        //Saves some bytes (gets minified) and improves performance
        _maps = {},
        _counter = 0,
        _cachedCredentials = null,
        _eventProxy = function(event) {
            var handler = event.target[event.type];
            //For safety double check if the handler exists
            if ($.isFunction(handler)) {
                var e = $.Event(event.type, {
                    originalEvent: event,
                    ovi: {
                        latitude: event.target.coordinate.latitude,
                        longitude: event.target.coordinate.latitude,
                        map: _maps[event.target.joviID]
                    },
                    target: event.target
                });
                handler.call(event.target.jovi, e);
            }
        },
        _registerApp = function(appID, authToken) {
            _cachedCredentials = {
                "appId": appID,
                "authenticationToken": authToken
            };
            _mapsAPI.util.ApplicationContext.set(_cachedCredentials);
        },
        _initMap = function(target, settings) {
            var components = [],
                mapID;
            //Mark target as initialized
            target.data(JOVI, true);
            //Setup components based on settings
            if (settings.behavior) {
                components.push(new _mapsAPI.map.component.Behavior());
            }
            if (settings.zoomBar) {
                components.push(new _mapsAPI.map.component.ZoomBar());
            }
            if (settings.scaleBar) {
                components.push(new _mapsAPI.map.component.ScaleBar());
            }
            if (settings.overview) {
                components.push(new _mapsAPI.map.component.Overview());
            }
            if (settings.typeSelector) {
                components.push(new _mapsAPI.map.component.TypeSelector());
            }
            if (settings.positioning) {
                components.push(new _mapsAPI.positioning.component.Positioning());
            }
            if (settings.traffic) {
                components.push(new _mapsAPI.map.component.Traffic());
            }
            if (settings.publicTransport) {
                components.push(new _mapsAPI.map.component.PublicTransport());
            }
            if (settings.contextMenu && _mapsAPI.map.component.ContextMenu) {
                components.push(new _mapsAPI.map.component.ContextMenu());
            }
            //See if we have a valid ID, otherwise generate one
            mapID = target.attr('id');
            if (!mapID) {
                mapID = JOVI + (_counter++);
                //Set id for future reference
                target.attr('id', mapID);
            }

            _maps[mapID] = new _mapsAPI.map.Display(target[0], {
                //zoom level for the map
                zoomLevel: settings.zoom,
                //center coordinates
                center: settings.center,
                components: components
            });
            //Litle trick to verify whether or not a map was loaded (and actually displayed).
            //Inspired by: http://maps.vicchi.org/ovi-events.php
            //I know closures should be avoided. However in this case I believe it is a good solution
            //until Function.bind() will be implemented in all browsers. And anyway in general there won't
            //be many maps in the same page, so most likely only one closure will exist at any give time.
            _maps[mapID].mapLoaded = false;
            _maps[mapID].addListener('mapviewchangeend', function(event) {
                var that = this;
                if (that.mapLoaded === false) {
                    //Then this map hasn't been loaded or displayed yet:
                    //fire callbacks
                    var e = $.Event(joviEvents.MAP_LOADED, {
                        originalEvent: event,
                        ovi: {
                            map: that
                        }
                    });
                    if ($.isFunction(settings.mapLoaded)) {
                        settings.mapLoaded.call(target, e);
                    }
                    //Fire a generic load event on the target
                    //just in case somebody is listening
                    target.trigger(joviEvents.MAP_LOADED, e);
                    that.mapLoaded = true;
                }
            });
        },
        _onNokiaMapsAvailable = function(callback) {
            if (_loader && _loader.done) {
                _mapsAPI = nokia.maps;
                callback();
            } else {
                setTimeout(function() {
                    _onNokiaMapsAvailable(callback);
                }, 200);
            }
        },

        defaults = {
            //Ocala, FL
            center: [29.187778, -82.130556],
            zoom: 10,
            behavior: true,
            zoomBar: true,
            scaleBar: true,
            overview: false,
            traffic: false,
            publicTransport: false,
            typeSelector: true,
            positioning: false,
            searchManager: false,
            routingManager: false,
            kmlManager: false,
            mapLoaded: null
        },

        joviEvents = {
            MAP_LOADED: 'maploaded',
            INIT_DONE: '_initdone'
        },

        _JSLLoader = function(autoload, callback) {
            if (!(this instanceof _JSLLoader)) {
                return new _JSLLoader(autoload, callback);
            }
            var self = this;
            this.invoked = false;
            this.done = true;
            this.load = function() {
                var script, head, loadFeatures;
                if (self.invoked) {
                    return;
                }
                self.invoked = true;
                loadFeatures = function() {
                    nokia.maps.Features.load({
                        map: 'auto',
                        ui: 'auto',
                        search: 'auto',
                        routing: 'auto',
                        positioning: 'auto',
                        behavior: 'auto',
                        kml: 'auto'
                    }, function() {
                        self.done = true;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
                };
                head = document.getElementsByTagName('head')[0];
                script = document.createElement('script');
                script.src = 'http://api.maps.nokia.com/2.2.1/jsl.js';
                script.type = 'text/javascript';
                script.charset = "utf-8";
                script.onreadystatechange = function() {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        loadFeatures();
                    }
                };
                script.onload = loadFeatures;

                head.appendChild(script);
            };
            if (autoload) {
                this.done = false;
                this.load();
            }
        },
        _loader;

    // Create an object literal for the public methods
    var methods = {
        init: function(options, appID, authToken) {
            if (!_loader) {
                _loader = _JSLLoader(options.autoload===undefined?true:options.autoload);
            }
            var $this = $(this),
                context = this;
            // Use extend to create settings from passed options and the defaults
            var settings = $.extend({}, defaults, options);
            _onNokiaMapsAvailable(function() {
                //if _cachedCredentials is not null then the API information have been already set
                //It's probably a safe assumption that one doesn't want to set it again since
                //credentials are assigned on a per-application basis.
                if (_cachedCredentials === null && typeof appID === 'string' && typeof authToken === 'string') {
                    _registerApp(appID, authToken);
                }
                _initMap($this, settings);
                //$this.data(MQUEUE).executeAll(context);
                $this.trigger($.Event(joviEvents.INIT_DONE));
            });
        },
        map: function(callback) {
            callback.call($(this), _maps[$(this).attr('id')]);
        },
        dropMarker: function(where, options) {
            var self = this,
                mapID = $(self).attr('id'),
                defaultOptions = {
                    text: '',
                    textColor: '#333333',
                    fill: '#ff6347',
                    stroke: '#333333',
                    shape: 'balloon',
                    icon: undefined
                },
                settings, attribute, markerListeners = {
                    "click": [_eventProxy || $.noop, false, null],
                    "dblclick": [_eventProxy || $.noop, false, null],
                    "mousemove": [_eventProxy || $.noop, false, null],
                    "mouseover": [_eventProxy || $.noop, false, null],
                    "mouseout": [_eventProxy || $.noop, false, null],
                    "mouseenter": [_eventProxy || $.noop, false, null],
                    "mouseleave": [_eventProxy || $.noop, false, null],
                    "longpress": [_eventProxy || $.noop, false, null],
                    "dragstart": [_eventProxy || $.noop, false, null],
                    "drag": [_eventProxy || $.noop, false, null],
                    "dragend": [_eventProxy || $.noop, false, null]
                };

            settings = $.extend({}, defaultOptions, options);

            settings.textPen = {
                strokeColor: settings.textColor
            };
            settings.pen = {
                strokeColor: settings.stroke
            };
            settings.brush = {
                color: settings.fill
            };
            settings.jovi = self;
            settings.joviID = mapID;
            settings.eventListener = markerListeners;

            if (settings.icon) {
                _maps[mapID].objects.add(new _mapsAPI.map.Marker(where, settings));
            } else {
                _maps[mapID].objects.add(new _mapsAPI.map.StandardMarker(where, settings));
            }
        },
        showInfoBubble: function(where, options) {
            var self = this,
                mapID = $(self).attr('id'),
                defaultOptions = {
                    content: ''
                },
                settings, bubbles;

            settings = $.extend({}, defaultOptions, options);
            if (settings.content) {
                if (settings.content.jquery) {
                    //This is a little hack to fix word-wrap which is set to nowrap by the OVI framework
                    settings.content.css('white-space', 'normal');
                    settings.content = $('<div/>').append(settings.content.clone()).html();
                }
            } else {
                settings.content = '';
            }
            bubbles = _maps[mapID].getComponentById('InfoBubbles') || _maps[mapID].addComponent(new _mapsAPI.map.component.InfoBubbles());
            bubbles.openBubble(settings.content, new _mapsAPI.geo.Coordinate(where[0], where[1]));
        },
        setCenter: function(where, withAnimation) {
            var $this = $(this),
                animationType = withAnimation ? 'default' : 'none';

            _maps[$this.attr('id')].setCenter(where, animationType);
        },
        setZoom: function(level) {
            var $this = $(this);

            _maps[$this.attr('id')].set('zoomLevel', level);
        },
        setType: function(type) {
            var $this = $(this),
                map = _maps[$this.attr('id')],
                mType;

            switch (type) {
            case 'map':
                mType = map.NORMAL;
                break;
            case 'satellite':
                mType = map.SATELLITE;
                break;
            case 'terrain':
                mType = map.TERRAIN;
                break;
            default:
                mType = map.NORMAL;
            }
            map.set('baseMapType', mType);
        },
        parseKml: function(kmlFile, callback) {
            var $this = $(this),
                self = this,
                mapID = $this.attr('id'),
                map = _maps[mapID],
                kml = new _mapsAPI.kml.Manager();

            kml.addObserver("state", function kmlLoadStateChange(kmlManager) {
                // KML file was successfully loaded
                if (kmlManager.state == "finished") {
                    // KML file was successfully parsed
                    callback.call(self, kmlManager);
                }
            });
            kml.parseKML(kmlFile);
        },
        addKml: function(kmlFile, callback) {
            // Helper to simplify adding a KML file to the map
            var $this = $(this),
                self = this,
                mapID = $this.attr('id'),
                map = _maps[mapID];

            $this.jOVI('parseKml', kmlFile, function(kmlManager) {
                    resultSet = new _mapsAPI.kml.component.KMLResultSet(kmlManager.kmlDocument, map);
                    resultSet.addObserver("state", function finishedStateHandler(resultSet) {
                        if (resultSet.state == "finished") {
                            callback.call(self, resultSet);
                        }
                    });
                    // Add the container to the map's object collection so they will be rendered onto the map.
                    map.objects.add(resultSet.create());
            });
        }

    };

    $.fn.jOVI = function(method) {
        //Make a copy of the arguments
        var a = Array.prototype.slice.call(arguments, 0),
            init = false;
        if (methods[method]) {
            method = methods[method];
            // Our method was sent as an argument, remove it using slice because it's not an argument for our method
            a = Array.prototype.slice.call(a, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
            init = true;
        } else {
            $.error('Method ' + method + ' does not exist on jOVI');
            return this;
        }
        return this.each(function() {
            var that = this;
            // Use apply to send arguments when calling our selected method
            if ((_loader && _loader.done) || init) {
                method.apply(that, a);
            } else {
                $(this).one(joviEvents.INIT_DONE, function() {
                    method.apply(this, a);
                }); //one uses bind in jQuery < 1.7 and on in jQuery > 1.7
            }
        });
    };

})(jQuery);