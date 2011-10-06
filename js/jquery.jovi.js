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
    var
    	_maps = {},
        _counter = 0,
        _cachedCredentials = null,
        _eventProxy = function (event) {
        	var handler = event.target [event.type];
        	//For safety double check if the handler exists
        	if ($.isFunction (handler)) {
	        	var e = $.Event (event.type, {
	        		originalEvent: event,
	        		ovi: {
	        			latitude: event.target.coordinate.latitude,
	        			longitude: event.target.coordinate.latitude,
	        			map: _maps [event.target.joviID]
	        		},
	        		target: event.target
	        	});
	        	handler.call (event.target.jovi, e);
	        }
        },
        _registerApp = function (appID, authToken) {
            _cachedCredentials = {"appId": appID, "authenticationToken": authToken};
        	ovi.mapsapi.util.ApplicationContext.set(_cachedCredentials);
        },
        _initMap = function(target, settings) {
            var components = [],
            	mapID;
            //Setup components based on settings
            if (settings.behavior) {
                components.push(new ovi.mapsapi.map.component.Behavior());
            }
            if (settings.zoomBar) {
                components.push(new ovi.mapsapi.map.component.ZoomBar());
            }
            if (settings.scaleBar) {
                components.push(new ovi.mapsapi.map.component.ScaleBar());
            }
            if (settings.overview) {
                components.push(new ovi.mapsapi.map.component.Overview());
            }
            if (settings.viewControl) {
                components.push(new ovi.mapsapi.map.component.ViewControl());
            }
            if (settings.rightClick) {
                components.push(new ovi.mapsapi.map.component.RightClick());
            }
            if (settings.overlaySelector) {
                components.push(new ovi.mapsapi.map.component.OverlaysSelector());
            }
            if (settings.typeSelector) {
                components.push(new ovi.mapsapi.map.component.TypeSelector());
            }
            if (settings.searchManager && ovi.mapsapi.search.Manager) {
                components.push(new ovi.mapsapi.search.component.SearchComponent());
                components.push(new ovi.mapsapi.search.component.RightClick());
            }
            if (settings.routingManager && ovi.mapsapi.routing.Manager) {
                if (ovi.mapsapi.search.Manager) {
                    components.push(new ovi.mapsapi.routing.component.RouteComponent());
                }
                components.push(new ovi.mapsapi.routing.component.RightClick());
            }
            //See if we have a valid ID, otherwise generate one
            mapID = target.attr('id');
            if (!mapID) {
                mapID = 'jovi' + (_counter++);
                //Set id for future reference
                target.attr ('id', mapID);
            }
            
            _maps [mapID] = new ovi.mapsapi.map.Display(target[0], {
                //zoom level for the map
                zoomLevel: settings.zoom,
                //center coordinates
                center: settings.center,
                components: components
            });
        },
        _onOVIAvailable = function(callback) {
            if (window.ovi && window.ovi.mapsapi && window.ovi.mapsapi.map) {
                callback();
            }
            else {
                setTimeout(function() {
                    _onOVIAvailable(callback);
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
            viewControl: true,
            rightClick: true,
            overlaySelector: true,
            typeSelector: true,
            searchManager: false,
            routingManager: false
        };

    // Create an object literal for the public methods
    var methods = {
        init: function(options, appID, authToken) {
            var $this = $(this);
            // Use extend to create settings from passed options and the defaults
            var settings = $.extend({}, defaults, options);
            _onOVIAvailable(function() {
                //if _cachedCredentials is not null then the API information have been already set
                //It's probably a safe assumption that one doesn't want to set it again since
                //credentials are assigned on a per-application basis.
            	if (_cachedCredentials !== null &&
            	    typeof appID === 'string' &&
            	    typeof authToken === 'string') {
            		_registerApp(appID, authToken);
            	}
                _initMap($this, settings);
            });
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
                settings,
                attribute,
                markerListeners = {
                	"click":      [_eventProxy || $.noop, false, null],
                	"dblclick":   [_eventProxy || $.noop, false, null],
                	"mousemove":  [_eventProxy || $.noop, false, null],
                	"mouseover":  [_eventProxy || $.noop, false, null],
                	"mouseout":   [_eventProxy || $.noop, false, null],
                	"mouseenter": [_eventProxy || $.noop, false, null],
                	"mouseleave": [_eventProxy || $.noop, false, null],
                	"longpress":  [_eventProxy || $.noop, false, null],
                	"dragstart":  [_eventProxy || $.noop, false, null],
                	"drag":       [_eventProxy || $.noop, false, null],
                	"dragend":    [_eventProxy || $.noop, false, null]
                };
            settings = $.extend({}, defaultOptions, options);
            
            settings.textPen       = {strokeColor: settings.textColor};
            settings.pen           = {strokeColor: settings.stroke};
            settings.brush         = {color: settings.fill};
            settings.jovi          = self;
            settings.joviID        = mapID;
			settings.eventListener = markerListeners;
			
            if (settings.icon) {
                _maps [mapID].objects.add(new ovi.mapsapi.map.Marker(where, settings));
            }
            else {
                _maps [mapID].objects.add(new ovi.mapsapi.map.StandardMarker(where, settings));
            }
        },
        showInfoBubble: function (where, options) {
        	var self = this,
        		mapID = $(self).attr('id'),
        		defaultOptions = {
                    content: ''
            	},
            	settings,
            	bubbles;
            settings = $.extend({}, defaultOptions, options);
            if (settings.content) {
            	if (settings.content.jquery) {
            		//This is a little hack to fix word-wrap which is set to nowrap by the OVI framework
            		settings.content.css ('white-space', 'normal');
            		settings.content = $('<div/>').append(settings.content.clone()).html();
            	}
            }
            else {
            	settings.content = '';
            }
            bubbles = _maps [mapID].getComponentById('InfoBubbles') || _maps [mapID].addComponent(new ovi.mapsapi.map.component.InfoBubbles());
            bubbles.addBubble(settings.content, new ovi.mapsapi.geo.Coordinate(where[0], where[1]));
        },
        setCenter: function(where, withAnimation) {
            var $this = $(this), animationType = withAnimation ? 'default' : 'none'
            _maps [$this.attr('id')].setCenter(where, animationType);
        },
        setZoom: function(level) {
            var $this = $(this);
            _maps [$this.attr('id')].set('zoomLevel', level);
        },
        setType: function(type) {
        	var $this = $(this), map = _maps [$this.attr('id')], mType;
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
        }
    };

    $.fn.jOVI = function(method) {
        //Make a copy of the arguments
        var a = Array.prototype.slice.call(arguments, 0);
        if (methods[method]) {
            method = methods[method];
            // Our method was sent as an argument, remove it using slice because it's not an argument for our method
            a = Array.prototype.slice.call(a, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jOVI');
            return this;
        }
        return this.each(function() {
            // Use apply to sent arguments when calling our selected method
            method.apply(this, a);
        });
    };

})(jQuery);