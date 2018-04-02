// AJAX基本方法库
~function(){
	// 创建AJAX对象
	function createXHR() {
		var xhr = null, flag = false;
		var ary = [
			function() {
				return new XMLHttpRequest;
			},
			function() {
				return new ActiveXObjext("Microsoft.XMLHTTP");
			},
			function() {
				return new ActiveXObjext("Msxm12.XMLHTTP");
			},
			function() {
				return new ActiveXObjext("Msxm13,XMLHTTP");
			}
		]
		for (var i=0; i<ary.length; i++) {
			var curFn = ary[i];
			try {
				xhr = curFn();
				createXHR = curFn;
				flag = true;
				break;
			} catch(e) {
				// 继续下一次循环
			}
		}
		return xhr;
		if (!flag) {
			throw new Error("您的浏览器不支持ajax，请更新浏览器");
		}
	}
	// 实现AJAX请求
	function ajax(options) {
		var _default = {
			url: "",
			type: "get",
			async: true,
			data: null,
			dataType: "json",
			getHead: null,  //->当readyState===2时执行的回调方法
			success: null  //->当readyState===4时执行的回调方法
		}
		for (var key in options) {
			if (options.hasOwnProperty(key)) {
				_default[key] = options[key];
			}
		}
		// 如果当前请求方式为GET，需要在url末尾加随机数清除缓存
		if (_default.type === "get") {
			_default.url.indexOf("?") >= 0 ? _default.url += "&" : _default.url += "?";
			_default.url += "_=" + Math.random();
		}
		var xhr = createXHR();
		xhr.open(_default.type, _default.url, _default.async);
		xhr.onreadystatechange = function() {
			if (/^2\d{2}$/.test(xhr.status)) {
				if (xhr.readyState === 2) {
					if (typeof _default.getHead === "function") {
						_default.getHead.call(xhr);
					}
				}
				if (xhr.readyState === 4) {
					var val = xhr.responseText;
					if (_default.dataType === "json") {
						val = "JSON" in window ? JSON.parse(val) : eval("(" + val + ")")
					}
					_default.success && _default.success.call(xhr, val);
				}
			}
		};
		xhr.send(_default.data);
	}
	// 暴露方法
	window.ajax = ajax;
}()