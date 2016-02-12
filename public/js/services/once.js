app.factory("$once", function () {
	var _cache = {};

	/***
	 * Run function only once in give duration
	 * @param markName			Mark function name
	 * @param func				Require function
	 * @param onceDuration		duration. Leave empty will only run once.
	 */
	var $once = function (markName ,func, onceDuration) {
		var _timestamp = _cache[markName];
		var _now = +new Date();
		if(!_timestamp || (typeof onceDuration === "number" && _now - (_timestamp || 0) > onceDuration)) {
			_cache[markName] = _now;
			func && func();
		}
	};
	return $once;
});