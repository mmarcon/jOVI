# jQuery jOVI

## Why jOVI?
Essentially for fun. I incidentally came across Nokia's map API, and since every time I've worked with map-based APIs it was always the omnipresent Google Maps API I decided I wanted to play with something different for once.

I wrote Javascript code for a few hours, had fun with Nokia's playground and I ended up with these considerations:

* The user interface and user experience of the maps at Nokia is great
* The API looks very complete, although I seem to understand they are continuously improving it
* The API has A LOT of features, most of which will never be used by the average web developer
* The documentation is kind of poor and not very user friendly

All these reasons led me to the idea of wrapping Nokia's API in a jQuery plugin that anybody can easily add to their website. I must say that what I am putting here today is version alpha 0.1, it doesn't have many features, I don't provide a minified version, but hey, you have to start from something right?

## Browser support
Successfully tested with Chrome, Firefox 5 and Safari on Mac OS. Works well also with IE9 and Opera.
Works on Mobile Safari (iOS 4) and Android browser.

## Getting jOVI
You can either look at the source code within the src directory or download the latest stable release (tar.gz) located in the dist directory.

## Installing jOVI
Once you've downloaded the plugin you will have to add the following lines either ad the end of you page head or at the end of the body. I usually prefer to insert scripts in the body section for performance reasons.

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="/path/to/jquery.jovi.js"></script>
	<script type="text/javascript">
		$(window).load({
			/*your code here*/
		});
	</script>

It is important to put your script in the **window.onload** callback. Otherwise the JSLA code shows some weird and undesired behavior, i.e. it completely empties the DOM.

## Nokia's Location API Business Models and Usage Restrictions
Nokia currently offers two business models for using the Location API´s. The first of these is a **developer model**, which allows developers to access the API´s for testing and development purposes subject to Nokia's terms and conditions. If developers, on the other hand, would like to deploy a website or a mobile application built with Nokia's Location API´s, then they will need to **register and obtain credentials** to use the standard option. Refer to [Nokia's Developer Website](http://www.developer.nokia.com/Develop/Web/Maps/Quota/) for more detailed information.

**Note that jOVI relies on Nokia's Location API.** Therefore if you plan on using it to build a website or a mobile application you will still need to obtain the necessary credentials. jOVI may be initialized with your Location API credentials, by passing appID and authorizationToken as the second and third parameter of the jOVI function. Look at the [reference](http://mmarcon.github.com/jOVI/docs.html) for more details.

**Side note:** As of today, 29.12.2011, there is a bug in the Nokia Developer website. API credentials are wrongly escaped, so you may need to change back the escape sequence with the actual character, e.g. `%3D` has to  be replaced with `=`.

I hope this bug gets fixed soon.