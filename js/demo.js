var JOVIDEMO = JOVIDEMO || {};

(function (D, $){

	D.Demos = function() {
		var demo_tpl = $('#demo_tpl').html(),
			demosDOM = $('.demo-set'),
			demos = [], d,
			APP_ID = 'bSHWrc1-bjcr-0q4ziaw', AUTH_KEY = 'D9X4qmYWbj4v/c1U4VljYw==';
			
		d = $.tmpl(demo_tpl, {title: 'Simple Map', id:'simple-map', description:'Simple map, centered in New York City. AppID and Authorization Token are passed in the initialization method.'});
		d.children('.map').jOVI({center: [40.716667, -74]}, APP_ID, AUTH_KEY);
		demos.push(d);
		
		d = $.tmpl(demo_tpl, {title: 'Simple Marker', id:'simple-marker', description:'Simple map, centered in New York City with a simple bubble Marker.'});
		d.children ('.map').jOVI({center: [40.716667, -74]}).jOVI('dropMarker', [40.716667, -74], {text: '!', textColor: '#fff'});
		demos.push(d);
		
		d = $.tmpl(demo_tpl, {title: 'Icon Marker', id:'icon-marker', description:'Simple map, centered in Liberty Island with an icon used as a Marker. Zoom level is customized.'});
		d.children ('.map').jOVI({center: [40.69, -74.045278]}).jOVI('dropMarker', [40.69, -74.045278], {icon: 'images/liberty.png'}).jOVI('setZoom', 16);
		demos.push(d);
		
		d = $.tmpl(demo_tpl, {title: 'Customized Map', id:'customized-map', description:'Map completely customized. Components, map types, right click features (search, routing), map overview are customized in this example.'});
		d.children ('.map').jOVI ({center: [38.895111, -77.036667], //Washington D.C.
								   zoom: 12,                        //Zoom level
								   behavior: true,                  //Essentially mouse dragging and scrolling
								   zoomBar: false,                  //Zoom bar
								   scaleBar: false,                 //Scale bar at the bottom
								   overview: true,                  //Little zoomed-out view (bottom-right)
								   viewControl: true,               //Control for panning
								   rightClick: true,                //Mouse right click enabled
								   typeSelector: true,              //Controls to choose map, satellite or terrain
								   searchManager: true,             //Right click  gives info on the location
								   routingManager: true             //Right click allows to show routes on the map
								}).jOVI ('setType', 'terrain');      //type can be map, satellite, terrain
		demos.push(d);
		
		d = $.tmpl(demo_tpl, {title: 'Marker Events', id:'marker-events', description:'Map with Marker Click Event.'});
		d.children ('.map').jOVI ({center: [40.716667, -74]})
         .jOVI ('dropMarker', [40.716667, -74],
                {text: '?',
                 textColor: '#fff',
                 fill: '#222',
                 click: function (event){
                     alert ('Clicked on marker. Marker says: ' + event.target.myOwnParameter);
                 },
                 //Any parameter in the marker configuration
                 //gets passed back along with the event info
                 //as part of the target attribute
                 //(see click callback above)
                 myOwnParameter: 'Hello world!'});
                 //Other supported events for markers are: dblclick, mousemove, mouseover,
                 //mouseout, mouseenter, mouseleave, longpress.
		demos.push(d);
		
		d = $.tmpl(demo_tpl, {title: 'Info Bubbles', id:'info-bubbles', description:'Map with an Info Bubble.'});
		d.children('.map').jOVI ({center: [40.716667, -74]})
                          .jOVI ('dropMarker', [40.716667, -74], {text: '0', textColor: '#fff'})
                          .jOVI ('setType', 'terrain')
                          .jOVI ('showInfoBubble', [40.716667, -74], {content: 'jOVI is pretty cool'});
		demos.push(d);
		
		$.each (demos, function(){
			$(this).hide().appendTo(demosDOM);
		});
	};
	
	D.Slides = function() {
		var left = $('<span class="control left"/>'), right = $('<span class="control right"/>'),
		click = function(isLeft){
			var goLeft = $(this).hasClass('left') || isLeft === true,
			num = $('.demo').length, visible = $('.demo:visible').hide().index();
			if (goLeft) {
				visible --;
			}
			else {
				visible ++;
			}
			$('.demo').eq(visible % num).show();
		};
		$('.demo:first').show();
		$('.demo-set').append(left).append(right);
		left.bind('click', click);
		right.bind('click', click);
		$(document).keydown(function(e){
			switch (e.keyCode) {
				case 37:
					click (true);
					break;
				case 39:
					click (false);
					break;
			}
		    return false;
		});
	};

	D.loadModules = function() {
		var fn, a, l = arguments.length;
		for (a=0; a<l; a++) {
			fn = arguments[a];
			if (typeof this [fn] === 'function') {
				this [fn].call();
			}
			else {
				throw new Error('Module ' + fn + ' not found');
			}
		}
	};
}(JOVIDEMO, jQuery));

$(function(){
	JOVIDEMO.loadModules ('Demos', 'Slides');
});