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

`<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>`

`<script type="text/javascript" src="/path/to/jquery.jovi.js"></script>`

`<script type="text/javascript">`

`$(window).load({/*your code here*/});`

`</script>`

It is important to put your script in the **window.onload** callback. Otherwise the JSLA code shows some weird and undesired behavior, i.e. it completely empties the DOM.