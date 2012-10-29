.PHONY: dist

PLUGIN = jovi

deps:
	npm install

dist:
	./node_modules/.bin/uglifyjs -o dist/jquery.$(PLUGIN).min.js src/jquery.$(PLUGIN).js