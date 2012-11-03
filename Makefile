.PHONY: dist

PLUGIN = jovi

deps:
	npm install

dist:
	@./node_modules/.bin/uglifyjs -o dist/jquery.$(PLUGIN).min.js src/jquery.$(PLUGIN).js; stat -f "%z" dist/jquery.$(PLUGIN).min.js

doc:
	@docco -t docs/docco.jst -o pages src/jquery.$(PLUGIN).js;mv pages/jquery.$(PLUGIN).html pages/docs.html