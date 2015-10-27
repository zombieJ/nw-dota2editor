'use strict';

// ======================================================
// =                        键值                        =
// ======================================================
app.factory("KV", function() {
	var _KV = function(list, keepValObjContent) {
		var _lines = typeof list === "string" ? list.split(/\n/) : list;

		var _tmpComment = "";
		var _tmpEntity, _tmpEntityStartLine;
		var _tmpLF = 0;

		this.title = null;
		this.comment = "";
		this.kvList = [];


		var _phase = 0;// 0 { not match; 1 { matched; 2 inner holder; 3 } matched;

		for(var _lineNum = 0 ; _lineNum < _lines.length ; _lineNum += 1) {
			var _line = (_lines[_lineNum] || "").trim();

			var _content = "";
			var _comment = "";

			var _commentPos = _line.indexOf("//");
			_content = _commentPos != -1 ? _line.slice(0, _commentPos) : _line;
			_comment = _commentPos != -1 ? _line.slice(_commentPos + 2) : "";

			_content = _content.trim();

			// 如果标题尚未匹配
			if(this.title === null) {
				if(_comment) this.comment += _comment + "\n";
				var _match = _content.match(/"(.*)"/);
				if(_match) {
					this.title = _match[1];
				}
			}

			// 如果已经匹配标题
			else {
				// 匹配 "{"
				if(_phase === 0) {
					if(_comment) this.comment += _comment + "\n";
					if(_content === "{") _phase = 1;

				// 匹配 Key - Value
				} else if(_phase === 1) {
					if(_comment) _tmpComment += _comment + "\n";
					var _match = _content.match(/"([^"]*)"(\s+"([^"]*)")?/);
					if(!_match) continue;

					var _key = _match[1];
					var _value = _match[3];
					if(_value) {
						this.kvList.push({
							key: _key,
							value: _value,
							comment: _tmpComment,
						});
						_tmpComment = "";
					} else {
						_phase = 2;
						_tmpEntityStartLine = _lineNum;
						_tmpEntity = {
							key: _key,
							value: null,
							comment: _tmpComment,
						}
						this.kvList.push(_tmpEntity);
						_tmpComment = "";
					}

				// 匹配 Value Entity
				} else if(_phase === 2) {
					if(_content === "{") {
						_tmpLF += 1;
					} else if(_content === "}") {
						_tmpLF -= 1;
						if(_tmpLF === 0) {
							_tmpEntity.value = new _KV(_lines.slice(_tmpEntityStartLine, _lineNum + 1));
							_tmpEntity.value.comment = _tmpEntity.comment;
							if(keepValObjContent) _tmpEntity.value.content = _lines.slice(_tmpEntityStartLine, _lineNum + 1).join("\n");
							_phase = 1;
						}
					}
				}
			}
		}

		return this;
	};

	_KV.prototype.kvToString = function() {
		var _str = $.map(this.kvList, function(kv) {
			return '"'+kv.key+'"    "'+kv.value+'"';
		}).join("\n");
		return _str;
	};

	return _KV;
});