onmessage = function(event) {
	var _map = JSON.parse(event.data);
	var _revertMap = {};
	for(var srcPath in _map) {
		var NameList = _map[srcPath];
		for(var i = 0 ; i < NameList.length ; i += 1) {
			_revertMap[NameList[i]] = srcPath;
		}
	}

	postMessage({
		map: _map,
		revertMap: _revertMap
	});
};