var http = require("http");
var url = require("url");
var fs = require("fs");

var server = http.createServer(function (req,res) {
	var urlObj = url.parse(req.url, true);
	var pathname = urlObj.pathname;
	var query = urlObj.query;
	// 静态资源文件的请求
	var reg = /\.(HTML|CSS|JS|ICO)/i;
	if (reg.test(pathname)) {
		var suffix = reg.exec(pathname)[1].toUpperCase();
		var suffixMIME = "text/html";
		switch (suffix) {
			case "CSS":
				suffixMIME = "text/css";
				break;
			case "JS":
				suffixMIME = "text/javascript";
				break;
		}
		try {
			var resFile = fs.readFileSync("." + pathname, "utf-8");
			res.writeHead(200, {"content-type": suffixMIME + ";charset=utf-8"});
			res.end(resFile);
		} catch(e) {
			res.writeHead(404, {"content-type": "text/plain;charset=utf-8"});
			res.end("page is not found");
		}
		return;
	}

	// API数据接口处理
	var con = null;
	var	customId = null;
	var customPath = "./json/database.json";
	var result = null;
	// 获取database.json文件内容
	con = fs.readFileSync(customPath, "utf-8");
	con.length === 0 ? con = '[]' : null; //->以防文件为空con转化JSON报错
	con = JSON.parse(con);

	// 获取所有客户信息
	if (pathname === "/getList") {
		result = {
			code: 1,
			msg: "没有任何客户信息",
			data: null
		}
		if (con.length > 0) {
			result = {
				code: 0,
				msg: "成功",
				data: con
			}
		}
		res.writeHead(200, {'content-type': 'application/json;charset=utf-8'})
		res.end(JSON.stringify(result));
		return;
	}
	//2)根据传递进来的客户ID获取某一个具体的客户信息
	if (pathname === "/getInfo") {
		customId = query["id"]; 
		result = {
			code: 1,
			msg: "当前客户不存在",
			data: null
		};
		for(var i=0; i<con.length; i++){
			if (con[i]["id"] == customId) {  
				result = {
					code: 0,
					msg: "成功",
					data: con[i]
				};
				break;
			}
		}
		res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
		res.end(JSON.stringify(result));
		return;
	}

	//3)根据传递进来的客户ID删除某一个具体的客户信息
	if (pathname === "/removeInfo") {
		customId = query["id"];
		result = {
			code: 1,
			msg: "当前客户不存在",
			data: null
		};
		var flag = false; //设置是否写入文件的标识
		for(var i=0; i<con.length; i++){
			if (con[i]["id"] == customId) {  
				con.splice(i,1);
				flag = true;
				break;
			}
		}
		result = {
			code: 1,
			msg: "删除失败"
		};
		if (flag) {
			fs.writeFileSync(customPath, JSON.stringify(con), "utf-8"); 
			result = {
				code: 0,
				msg: "删除成功"
			};
		}
		res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
		res.end(JSON.stringify(result));
		return;
	}

	//4)增加客户信息
	if (pathname === "/addInfo") {
		var str = '';
		req.on("data", function(chunk) {
			str += chunk;
		});
		req.on("end", function() {
			if (str.length === 0) {
				res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
				res.end(JSON.stringify({
					code: 1,
					msg: "无信息，增加客户信息失败"
				}));
				return;
			}
			var data = JSON.parse(str); 
			data["id"] = con.length === 0 ? 1 : parseFloat(con[con.length-1]["id"]) + 1;
			con.push(data);
			fs.writeFileSync(customPath, JSON.stringify(con), "utf-8"); 
			res.end(JSON.stringify({
					code: 0,
					msg: "增加客户信息成功"
			}));
		});
		return;
	}

	//5)修改客户信息
	if (pathname === "/updateInfo") {
		str = '';
		req.on("data", function(chunk) {
			str += chunk;
		});
		req.on("end", function() {
			if (str.length === 0) {
				res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
				res.end(JSON.stringify({
					code: 1,
					msg: "修改失败，无传递任何信息"
				}));
				return;
			}
			var flag = false,
				data = JSON.parse(str); 
			for(var i=0; i<con.length; i++){
				if (con[i]["id"] == data["id"]) {  
					con[i] = data;
					flag = true;
					break;
				}
			}
			if (flag) {
				fs.writeFileSync(customPath, JSON.stringify(con), "utf-8");
				console.log(1)
				result = {
					code: 0,
					msg: "客户信息修改成功"
				};
			}
			res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
			res.end(JSON.stringify(result));
		});
		return;
	}
	//如果请求的地址不存在，提示404不存在
	res.writeHead(404, {'content-type': 'text/plain;charset=utf-8;'});
	res.end("API is not found");
});

server.listen(8080, function() {
	console.log("server is success, listening on 8080 port");
})