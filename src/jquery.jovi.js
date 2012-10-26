(function($, w, doc){
    var plugin = 'jOVI',
        version = '0.2.0',
        defaults = {}, H, _ns, _JSLALoader;

    function jHere(element, options){
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._plugin = plugin;
        this.init();
    }

    H = jHere.prototype;

    H.init = function(){
        var options = this.options;
    };

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
        return this.each(function() {
            var pluginObj, method, args, key = 'plugin_' + plugin;
            pluginObj = $.data(this, key);
            if (!pluginObj) {
                pluginObj = new Plugin(this, options);
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
                args = Array.prototype.slice.call(arguments, 0);
                args.shift();
                if (typeof pluginObj.prototype[method] !== 'function') {
                    $.error(plugin + '::Method ' + method + ' does not exist');
                }
                pluginObj.prototype[method].apply(pluginObj, args);
            }
        });
    };


})(jQuery, window, document);