$(function(){
    //Setup test areas
    $('.test h3').live ('click', function(){
        $(this).siblings('div').toggle();
    });
    
    //Test cases
    var container = $('#tests'), counter = 0;
    
    //1- Simple Map
    var simpleMap = getTestTemplate ('Simple Map', 'test-map-' + counter++).appendTo (container);
    simpleMap.children('.map').jOVI();
    
    //2- Simple Marker
    var simpleMarker = getTestTemplate ('Simple Marker', 'test-map-' + counter++).appendTo (container);
    simpleMarker.children('.map').jOVI ({center: [40.716667, -74]})
                                 .jOVI ('dropMarker', [40.716667, -74], {text: '!', textColor: '#fff'});
                                 
    //3- Icon Marker
    var iconMarker = getTestTemplate ('Icon Marker', 'test-map-' + counter++).appendTo (container);
    iconMarker.children('.map').jOVI ({center: [40.716667, -74]})
                               .jOVI ('dropMarker', [40.69, -74.045278], {icon: 'images/liberty.png'})
                               .jOVI('setCenter',  [40.69, -74.045278])
                               .jOVI('setZoom', 16);
                               
    //4- Full featured
    var ff = getTestTemplate ('Full Featured', 'test-map-' + counter++).appendTo (container);
    ff.children('.map').jOVI ({
                            center: [38.895111, -77.036667], //Washington D.C.
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
});

function getTestTemplate (title, id) {
    var template = $('<div/>', {'class': 'test', id: id});
    template.append ('<h3>' + title + '</h3>');
    template.append ('<div class="map"/>');
    return template;          
}