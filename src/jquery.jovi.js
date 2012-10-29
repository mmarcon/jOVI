(function($, w, doc){
    var plugin = 'jOVI',
        version = '0.2.0',
        defaults, H, _ns, _JSLALoader,
        _credentials;

    defaults = {
        appId: '_peU-uCkp-j8ovkzFGNU',
        authToken: 'gBoUkAMoxoqIWfxWA5DuMQ',
        zoom: 12,
        center: [52.49, 13.37],
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
        marker: {
            text: '',
            textColor: '#333333',
            fill: '#ff6347',
            stroke: '#333333',
            shape: 'balloon',
            icon: undefined
        },
        bubble: {
            content: '',
            closable: true,
            onclose: $.noop
        }
    };

    function jOVI(element, options){
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._plugin = plugin;
        this.init();
    }

    H = jOVI.prototype;

    H.init = function(){
        var options = this.options;
        _JSLALoader.load().is.done($.proxy(this.makemap, this));
    };

    H.makemap = function(){
        var options = this.options,
            component = _ns.map.component,
            components = [];
        //First of all sort out the credential thingy
        _credentials = _credentials || {
            appId: options.appId,
            authenticationToken: options.authToken
        };
        _ns.util.ApplicationContext.set(_credentials);

        //and now make the map
        $.data(this.element, plugin, true);

        //Setup the components
        //TODO: I really don't like this way of handing it
        if (options.behavior) {
            components.push(new component.Behavior());
        }
        if (options.zoomBar) {
            components.push(new component.ZoomBar());
        }
        if (options.scaleBar) {
            components.push(new component.ScaleBar());
        }
        if (options.overview) {
            components.push(new component.Overview());
        }
        if (options.typeSelector) {
            components.push(new component.TypeSelector());
        }
        if (options.positioning) {
            components.push(new _ns.positioning.component.Positioning());
        }
        if (options.traffic) {
            components.push(new component.Traffic());
        }
        if (options.publicTransport) {
            components.push(new component.PublicTransport());
        }
        if (options.contextMenu && component.ContextMenu) {
            components.push(new component.ContextMenu());
        }
        this.map = new _ns.map.Display(this.element, {
            zoomLevel: options.zoom,
            center: options.center,
            components: components
        });
    };

    H.center = function(newCenter){
        this.map.setCenter(newCenter);
    };

    H.zoom = function(newZoomLevel){
        this.map.set('zoomLevel', newZoomLevel);
    };

    H.type = function(newType){
        var map = this.map;
        switch (newType) {
            case 'map':
                newType = map.NORMAL;
                break;
            case 'satellite':
                newType = map.SATELLITE;
                break;
            case 'terrain':
                newType = map.TERRAIN;
                break;
            case 'smart':
                newType = map.SMARTMAP;
                break;
            default:
                newType = map.NORMAL;
        }
        map.set('baseMapType', newType);
    };

    H.marker = function(position, markerOptions) {
        var markerListeners = {
                "click": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "dblclick": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "mousemove": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "mouseover": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "mouseout": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "mouseenter": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "mouseleave": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "longpress": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "dragstart": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "drag": [$.proxy(triggerEvent, this) || $.noop, false, null],
                "dragend": [$.proxy(triggerEvent, this) || $.noop, false, null]
            };
        markerOptions = $.extend({}, defaults.marker, markerOptions);
        //Normalize settings
        markerOptions.textPen = markerOptions.textPen || {strokeColor: markerOptions.textColor};
        markerOptions.pen = markerOptions.pen || {strokeColor: markerOptions.stroke};
        markerOptions.brush = markerOptions.brush || {color: markerOptions.fill};
        markerOptions.eventListener = markerListeners;

        if (markerOptions.icon) {
            this.map.objects.add(new _ns.map.Marker(position, markerOptions));
        } else {
            this.map.objects.add(new _ns.map.StandardMarker(position, markerOptions));
        }
    };

    H.bubble = function(position, bubbleOptions) {
        var bubbleComponent;
        bubbleOptions = $.extend({}, defaults.bubble, bubbleOptions);
        if(bubbleOptions.content.jquery) {
            //This is a little hack to fix word-wrap which is set to nowrap by the OVI framework
            bubbleOptions.content.css('white-space', 'normal');
            bubbleOptions.content = $('<div/>').append(bubbleOptions.content.clone()).html();
        }
        bubbles = this.map.getComponentById('InfoBubbles') ||
                  this.map.addComponent(new _ns.map.component.InfoBubbles());
        bubbles.openBubble(bubbleOptions.content, {latitude: position[0], longitude: position[1]}, bubbleOptions.onclose, !bubbleOptions.closable);
    };

    H.kml = function(KMLFile, zoomToKML, ondone) {
        if(isFunction(zoomToKML)) {
            ondone = zoomToKML;
            zoomToKML = false;
        }
        parseKML.call(this, KMLFile, $.proxy(function(kmlManager){
            var resultSet = new _ns.kml.component.KMLResultSet(kmlManager.kmlDocument, this.map);
            resultSet.addObserver("state", $.proxy(function(resultSet) {
                var container, bbox;
                if (resultSet.state == "finished") {
                    if(zoomToKML) {
                        container = resultSet.container.objects.get(0);
                        bbox = container.getBoundingBox();
                        if (bbox) {
                            this.map.zoomTo(bbox);
                        }
                    }
                    if(isFunction(ondone)) {
                        ondone.call(this, resultSet);
                    }
                }
            }, this));
            this.map.objects.add(resultSet.create());
        }, this));
    };

    //This function returns the original map
    //object. This is useful when advanced operations
    //that are not exposed by this plugin need to be
    //performed. Check api.maps.nokia.com for the
    //documentation.
    H.originalMap = function(closure){
        //Be a good citizen:
        //closure context will be the DOM element
        //the jQuery object refers to, and argument
        //is the Display object, i.e. the map.
        closure.call(this.element, this.map);
    };

    //Note that this function is private
    //and must be called with a jOVI object
    //as the context.
    function parseKML(KMLFile, callback) {
        var kmlManager = new _ns.kml.Manager();
        kmlManager.addObserver('state', $.proxy(function(kmlManager){
            if(kmlManager.state === 'finished') {
                //KML file was successfully parsed
                callback.call(this, kmlManager);
            }
        }, this));
        kmlManager.parseKML(KMLFile);
    }

    function triggerEvent(event) {
        var handler = event.target[event.type];
        if ($.isFunction(handler)) {
            var e = $.Event(event.type, {
                originalEvent: event,
                geo: {
                    latitude: event.target.coordinate.latitude,
                    longitude: event.target.coordinate.longitude
                },
                target: event.target
            });
            //When the event listener is called then
            //the context is the DOM element containing the map.
            handler.call(this.element, e);
        }
    }

    function isFunction(fn) {
        return typeof fn === 'function';
    }

    _JSLALoader = {};
    _JSLALoader.is = false;
    _JSLALoader.load = function(){
        var head, jsla, load;
        if(_JSLALoader.is && _JSLALoader.is.state() === 'pending') {
            //JSLA loading is already in progress
            return this;
        }
        _JSLALoader.is = $.Deferred();
        //And load stuff
        load = function(){
            _ns = nokia.maps;
            _ns.Features.load({map: 'auto', ui: 'auto', search: 'auto', routing: 'auto',
                               positioning: 'auto', behavior: 'auto', kml: 'auto'},
                              function(){_JSLALoader.is.resolve();});
        };
        head = doc.getElementsByTagName('head')[0];
        jsla = doc.createElement('script');
        jsla.src = 'http://api.maps.nokia.com/2.2.1/jsl.js';
        jsla.type = 'text/javascript';
        jsla.charset = "utf-8";
        jsla.onreadystatechange = function(){
            if (jsla.readyState == "loaded" || jsla.readyState == "complete") {
                //The base JSLA has loaded. Trigger load of features
                load();
            }
        };
        jsla.onload = load;
        //Append JSLA to head so it starts loading
        head.appendChild(jsla);
        //Returns _JSLALoader itself.
        //Very elegant solution to do stuff
        //like this:
        //_JSLALoader.load().is.done(doStuff);
        return this;
    };

    $.fn[plugin] = function(options) {
        var args = arguments;
        return this.each(function() {
            var pluginObj, method, key = 'plugin_' + plugin;
            pluginObj = $.data(this, key);
            if (!pluginObj) {
                pluginObj = new jOVI(this, options);
                $.data(this, key, pluginObj);
            } else {
                //Plugin is already initialized
                //Then we must be calling a method perhaps
                //options must be the method then, so it should be a string
                if (typeof options !== 'string') {
                    $.error(plugin + '::Plugin already initialized on this element, expected method.');
                }
                method = options;
                //Get the arguments
                args = Array.prototype.slice.call(args, 1);
                if (typeof pluginObj[method] !== 'function') {
                    $.error(plugin + '::Method ' + method + ' does not exist');
                }
                //Only execute method when we are sure JSLA
                //is loaded and therefore everything else
                //has been initialized.
                //jQuery's deferred object takes care of queuing
                //actions.
                _JSLALoader.load().is.done(function(){
                    pluginObj[method].apply(pluginObj, args);
                });
            }
        });
    };


})(jQuery, window, document);