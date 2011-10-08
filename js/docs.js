var JOVIDOCS = JOVIDOCS || {};

(function (D, $){
	var DocParser = function (xml){
		this.xml = xml;
		this.x = $(xml);
		this.result = {};
	};
	
	DocParser.prototype.parse = function() {
		var self = this, x = self.x;
		x.find('method-group').each(function(){
			var group = $(this).attr('name'), cGroup;
			cGroup = self.result [group] = {};
			$(this).children('method').each (function(){
				var DOMmethod = $(this),
					method = DOMmethod.attr('name');
				cGroup [method] = {
					description: DOMmethod.attr('description'),
					parameters: {},
					errors: []
				};
				DOMmethod.children('parameters').children('parameter').each (function(){
					var DOMparameter = $(this),
						parameter = DOMparameter.attr('name');
					cGroup [method].parameters [parameter] = {
						description: DOMparameter.attr('description'),
						type: DOMparameter.attr('type'),
						options:{}
					};
					DOMparameter.children('options').children('option').each(function(){
						var DOMoption = $(this),
							option = DOMoption.attr('name');
						cGroup [method].parameters [parameter].options [option] = {
							description: DOMoption.attr('description'),
							type: DOMoption.attr('type')
						};
					});
				});
				DOMmethod.children('throw').children('error').each (function(){
					var DOMerror = $(this);
					cGroup [method].errors.push (DOMerror.attr('if'));
				});
			});
		});
	};

	D.Docs = function() {
		$.ajax('xml/jovi.docs.xml', {
			error: $.error,
			success: function (response) {
				var parser = new DocParser (response);
				parser.parse();
				console.log (parser.result);
			}
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
	
}(JOVIDOCS, jQuery));

$(function(){
	JOVIDOCS.loadModules ('Docs');
});