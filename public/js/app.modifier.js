'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function() {
	function fillAttr(modifier, attr, defaultValue) {
		if(defaultValue === undefined) {
			modifier[attr] = {};
			$.each(_ability[attr], function(i, item) {
				modifier[attr][item[0]] = false;
			});
		} else {
			modifier[attr] = defaultValue;
		}

		return function(desc, title) {
			modifier._requireList.push({
				attr: attr,
				title: title,
				desc: desc,
			});
		};
	}

	var _modifier = function() {
		var _my = this;

		_my._name = "undefined";

		return _my;
	};

	return _modifier;
});