var oList = document.getElementById("list");
// 数据绑定
var bindData = (function() {
	// 绑定
	function bindHTML (data) {
		var str = '';
		for (var i=0; i<data.length; i++) {
			var curData = data[i];
			str += '<li>';
				str += '<span class="w50">' + curData["id"] + '</span>';
				str += '<span class="w150">' + curData["name"] + '</span>';
				str += '<span class="w50">' + curData["age"] + '</span>';
				str += '<span class="w200">' + curData["tel"] + '</span>';
				str += '<span class="w200">' + curData["address"] + '</span>';
				str += '<span class="w150 control">';
					str += '<a href="addpage/add.html?id=' + curData["id"] + '">修改</a>';
					str += '<a href="javascript:;" customId="' + curData["id"] + '">删除</a>';
				str += '</span>';
			str += '</li>';
			oList.innerHTML = str;
		}
	}
	// 删除
	function removeCustom() {
		oList.onclick = function (e) {
			e = e || window.event;
			var tar = e.target || e.srcElement;
			var tarTag = tar.tagName.toUpperCase();
			// 点击的是删除按钮
			if (tarTag === "A" && tar.innerHTML === "删除") {
				var customId = tar.getAttribute("customId");
				var flag = window.confirm("确定要删除编号为" + customId +"的客户吗？");
				if (flag) {
					ajax({
						url: "/removeInfo?id=" + customId,
						success: function (jsonData) {
							if (jsonData && jsonData.code == 0) {
								oList.removeChild(tar.parentNode.parentNode);
								return;
							}
							alert(jsonData.msg);
						}
					})
				}
			}
		}
	}
	// 初始化
	function init() {
		ajax({
			url: "/getList",
			success: function (jsonData) {
				if (jsonData && jsonData.code == 0) {
					var data = jsonData["data"];
					bindHTML(data);
					removeCustom();
				}
			}
		})
	}
	return {
		init: init
	};
})();
// 执行
bindData.init();