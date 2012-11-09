.PHONY: dist

PLUGIN = jovi

deps:
	npm install

dist: plugin zepto summary

plugin:
	@./node_modules/.bin/uglifyjs -o dist/jquery.$(PLUGIN).min.js src/jquery.$(PLUGIN).js

zepto:
	@./node_modules/.bin/uglifyjs -o dist/zepto.adapter.min.js src/zepto.adapter.js

summary:
	@ls -nhl dist | awk '{print $$9,$$5}' | tail -n +2

doc:
	@docco -t docs/docco.jst -o pages src/jquery.$(PLUGIN).js;mv pages/jquery.$(PLUGIN).html pages/docs.html