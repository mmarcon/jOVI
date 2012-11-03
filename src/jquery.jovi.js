(function($, w, doc){
    var plugin = 'jOVI',
        version = '0.2.0',
        defaults, H, _ns, _JSLALoader,
        _credentials, bind = $.proxy;

    defaults = {
        appId: '_peU-uCkp-j8ovkzFGNU',
        authToken: 'gBoUkAMoxoqIWfxWA5DuMQ',
        zoom: 12,
        center: [52.49, 13.37],
        enable: ['behavior', 'zoombar', 'scalebar', 'typeselector'],
        /*All available components. Commented out, saves bytes.*/
        /*all: ['behavior', 'zoombar', 'scalebar', 'typeselector', 'overview', 'traffic', 'publictransport', 'positioning', 'rightclick', 'contextmenu']*/
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
        },
        heatmap: {
            max: 20,
            opacity: 0.8,
            coarseness: 2
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
        _JSLALoader.load().is.done(bind(this.makemap, this));
    };

    H.makemap = function(){
        var options = this.options,
            component = _ns.map.component,
            components = [];

        /*
         Positioning is incovieniently
         located in a namespace that is
         separated from all the other comps.
         Place where it should have been in
         the first place.
        */
        component.Positioning = _ns.positioning.component.Positioning;

        /*First of all sort out the credential thingy*/
        _credentials = _credentials || {
            appId: options.appId,
            authenticationToken: options.authToken
        };
        _ns.util.ApplicationContext.set(_credentials);

        /*and now make the map*/
        $.data(this.element, plugin, true);

        /*Setup the components*/
        $.each(component, bind(function(c, Constructor){
            if($.inArray(c.toLowerCase(), this.options.enable) > -1) {
                components.push(new Constructor());
            }
        }, this));

        this.map = new _ns.map.Display(this.element, {
            zoomLevel: options.zoom,
            center: options.center,
            components: components
        });
    };

    //### center the map
    //`$('.selector').jOVI('center', centerObject);`
    //
    //`centerObject` can be an object of type
    //
    //`{latitude: -43, longitude: 55}`
    //
    //or an array
    //
    //`[-43, 55]`
    H.center = function(newCenter){
        this.map.setCenter(newCenter);
    };

    //### zoom the map
    //`$('.selector').jOVI('zoom', zoomLevel);`
    //
    //`zoomLevel` is a positive integer
    H.zoom = function(newZoomLevel){
        this.map.set('zoomLevel', newZoomLevel);
    };

    //### set the map type
    //`$('.selector').jOVI('type', mapType);`
    //
    //`mapType` is a string:
    //
    // 1. `'map'`: the normal map type. This is the *default*.
    // 2. `'smart'`: a map with most of the colors grayed out. Useful for data visualization.
    // 3. `'pt'`: a smart map where the tiles also contain the **public transport lines**.
    // 4. `'satellite'`: satellite view.
    // 5. `'terrain'`: terrain view.
    H.type = function(newType){
        var map = this.map,
            types = {
                map: map.NORMAL,
                satellite: map.SATELLITE,
                smart: map.SMARTMAP,
                terrain: map.TERRAIN,
                pt: map.SMART_PT
            };
        newType = types[newType] || types.map;
        map.set('baseMapType', newType);
    };

    //### add markers to the map
    //`$('.selector').jOVI('marker', positionObject, markerOptions);`
    //
    //`positionObject` can be an object of type
    //
    //`{latitude: -43, longitude: 55}`
    //
    //or an array
    //
    //`[-43, 55]`
    //
    //`markerOptions` can be an object of type
    //<pre><code>{
    //  text: '!',
    //  textColor: '#333333',
    //  fill: '#ff6347',
    //  stroke: '#333333',
    //  icon: 'urlToIcon'
    //}</code></pre>
    H.marker = function(position, markerOptions) {
        var markerListeners = {},
            mouse = 'mouse', click = 'click',
            supportedEvents = [click,
                               'dbl' + click,
                               mouse + 'move',
                               mouse + 'over',
                               mouse + 'out',
                               mouse + 'enter',
                               mouse + 'leave',
                               'longpress'],
            centralizedHandler = bind(triggerEvent, this);
        $.each(supportedEvents, function(i, v){
            markerListeners[v] = [centralizedHandler, false, null];
        });

        markerOptions = $.extend({}, defaults.marker, markerOptions);
        /*Normalize settings*/
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

    //### add bubbles to the map
    //`$('.selector').jOVI('bubble', positionObject, bubbleOptions);`
    //
    //`positionObject` can be an object of type
    //
    //`{latitude: -43, longitude: 55}`
    //
    //or an array
    //
    //`[-43, 55]`
    //
    //`bubbleOptions` can be an object of type
    //<pre><code>{
    //  content: 'Hello World!',
    //  closable: true,
    //  onclose: function(){}
    //}</code></pre>
    //
    //`content` can be a String or a jQuery object.
    H.bubble = function(position, bubbleOptions) {
        var bubbleComponent;
        bubbleOptions = $.extend({}, defaults.bubble, bubbleOptions);
        if(bubbleOptions.content.jquery) {
            /*This is a little hack to fix word-wrap which is set to nowrap by JSLA*/
            bubbleOptions.content.css('white-space', 'normal');
            bubbleOptions.content = $('<div/>').append(bubbleOptions.content.clone()).html();
        }
        bubbles = this.map.getComponentById('InfoBubbles') ||
                  this.map.addComponent(new _ns.map.component.InfoBubbles());
        bubbles.openBubble(bubbleOptions.content, {latitude: position[0], longitude: position[1]}, bubbleOptions.onclose, !bubbleOptions.closable);
    };

    //### Display KMLs on the map
    //`$('.selector').jOVI('kml', KMLfile, zoomToKML, ondone);`
    //
    //`KMLfile` is the URL to a KML file
    //
    //`zoomToKML` is a boolean. If set to true, once the KML has been parsed
    //and displayed the map will be zoomed to the bounding box of the KML.
    //
    //`ondone` is a function, called once the KML has been rendered.
    H.kml = function(KMLFile, zoomToKML, ondone) {
        if(isFunction(zoomToKML)) {
            ondone = zoomToKML;
            zoomToKML = false;
        }
        parseKML.call(this, KMLFile, bind(function(kmlManager){
            var resultSet = new _ns.kml.component.KMLResultSet(kmlManager.kmlDocument, this.map);
            resultSet.addObserver("state", bind(function(resultSet) {
                var container, bbox;
                if (resultSet.state == "finished") {
                    if(zoomToKML) {
                        /*
                         Then try to zoom the map to the area
                         described by the KML
                        */
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

    //### Add heatmap layers to the map
    //`$('.selector').jOVI('heatmap', data, type, options);`
    //
    //`data` is an array of objects of type:
    //
    //`{latitude: 43, longitude: 26, value: 35}`
    //
    //Values will be automatically **normalized between 0 and 1**.
    //
    //`type` defines the type of heatmap, can be `density` or `value`. [Heatmaps on Wikipedia](http://en.wikipedia.org/wiki/Heat_map).
    //
    //`options` is an object that can have a `colors` property used to
    //customize the heatmap look.
    //
    //`colors` is an object of type:
    //<pre><code>{
    //  stops: {
    //    "0": "rgba(0, 0, 64, 1)",
    //    "0.3": "rgba(0, 0, 64, 1)",
    //    ...
    //  }
    //}</code></pre>
    H.heatmap = function(data, type, hmOptions) {
        var hm;
        type = type || 'value';
        if (!type.match(/^density|value$/)) {
            type = 'value';
        }
        hmOptions = hmOptions || {};
        hmOptions.type = type;
        hmOptions = $.extend({}, defaults.heatmap, hmOptions);
        hm = new _ns.heatmap.Overlay(hmOptions);
        hm.addData(data);
        this.map.overlays.add(hm);
    };

    //###Access the underlying JSLA framework
    //`$('.selector').jOVI('originalMap', closure);`
    //
    //This is useful when advanced operations
    //that are not exposed by this plugin need to be
    //performed. Check [api.maps.nokia.com](http://api.maps.nokia.com) for the
    //documentation.
    //closure should look like this:
    //<pre><code>function(map, nokia){
    //    this is the DOM element
    //    map is the JSLA map object
    //    nokia is the whole JSLA API namespace
    //}</code></pre>
    H.originalMap = function(closure){
        /*
         Be a good citizen:
         closure context will be the DOM element
         the jQuery object refers to, and argument
         is the Display object, i.e. the map.
        */
        closure.call(this.element, this.map, _ns);
    };

    /*
     Note that this function is private
     and must be called with a jOVI object
     as the context.
    */
    function parseKML(KMLFile, callback) {
        var kmlManager = new _ns.kml.Manager();
        kmlManager.addObserver('state', bind(function(kmlManager){
            if(kmlManager.state === 'finished') {
                /*KML file was successfully parsed*/
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
            /*
             When the event listener is called then
             the context is the DOM element containing the map.
            */
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
            /*JSLA loading is already in progress*/
            return this;
        }
        _JSLALoader.is = $.Deferred();
        /*And load stuff*/
        load = function(){
            _ns = nokia.maps;
            /*TODO: make load cutomizable so we don't load unnecessary stuff.*/
            _ns.Features.load({map: 'auto', ui: 'auto', search: 'auto', routing: 'auto',
                               positioning: 'auto', behavior: 'auto', kml: 'auto', heatmap: 'auto'},
                              function(){_JSLALoader.is.resolve();});
        };
        head = doc.getElementsByTagName('head')[0];
        jsla = doc.createElement('script');
        jsla.src = 'http://api.maps.nokia.com/2.2.1/jsl.js';
        jsla.type = 'text/javascript';
        jsla.charset = "utf-8";
        jsla.onreadystatechange = function(){
            if (jsla.readyState == "loaded" || jsla.readyState == "complete") {
                /*The base JSLA has loaded. Trigger load of features*/
                load();
            }
        };
        jsla.onload = load;
        /*Append JSLA to head so it starts loading*/
        head.appendChild(jsla);
        /*
         Returns _JSLALoader itself.
         Very elegant solution to do stuff
         like this:
         _JSLALoader.load().is.done(doStuff);
        */
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
                /*
                 Plugin is already initialized
                 Then we must be calling a method
                 options must be the method then, so it should be a string
                */
                if (typeof options !== 'string') {
                    $.error(plugin + '::Plugin already initialized on this element, expected method.');
                }
                method = options;
                /*Get the arguments*/
                args = Array.prototype.slice.call(args, 1);
                if (typeof pluginObj[method] !== 'function') {
                    $.error(plugin + '::Method ' + method + ' does not exist');
                }
                /*
                 Only execute method when we are sure JSLA
                 is loaded and therefore everything else
                 has been initialized.
                 jQuery's deferred object takes care of queuing
                 actions.
                */
                _JSLALoader.load().is.done(function(){
                    pluginObj[method].apply(pluginObj, args);
                });
            }
        });
    };


})(jQuery, window, document);