.PHONY: dist

PLUGIN = jovi

deps:
	npm install

dist: plugin zepto

plugin:
	@./node_modules/.bin/uglifyjs -o dist/jquery.$(PLUGIN).min.js src/jquery.$(PLUGIN).js; stat -f "%z" dist/jquery.$(PLUGIN).min.js

zepto:
	@./node_modules/.bin/uglifyjs -o dist/zepto.adapter.min.js src/zepto.adapter.js; stat -f "%z" dist/zepto.adapter.min.js

doc:
	@docco -t docs/docco.jst -o pages src/jquery.$(PLUGIN).js;mv pages/jquery.$(PLUGIN).html pages/docs.html