// moeproject parser

var MOEPROJ = MOEPROJ || new Object();
var MOEPARSER = MOEPROJ.MOEPARSER || new Object();

var fs = require('fs');
var jsdom = require("jsdom");
MOEPARSER.ENTRY_URL = [
// english
//"http://en.moegirl.org/Amakase_Miharu",
// random
//"http://zh.moegirl.org/Special:%E9%9A%8F%E6%9C%BA%E9%A1%B5%E9%9D%A2",
// my version
"http://feizhan.github.io/moeproject/resources/%E5%8D%83%E7%9F%B3%E6%8A%9A%E5%AD%90%20-%20%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_%E4%B8%87%E7%89%A9%E7%9A%86%E5%8F%AF%E8%90%8C%E7%9A%84%E7%99%BE%E7%A7%91%E5%85%A8%E4%B9%A6.html",
// mainpage
//"http://zh.moegirl.org/Mainpage",
// example
//"http://zh.moegirl.org/%E5%8D%83%E7%9F%B3%E6%8A%9A%E5%AD%90",
];
MOEPARSER.contents = new Object();

MOEPARSER.parse = function () {
	for (var i in MOEPARSER.ENTRY_URL) {
		MOEPARSER.parsePage(MOEPARSER.ENTRY_URL[i]);
	}
};
MOEPARSER.parsePage = function (url) {
	if (url in MOEPARSER.contents) {
		return;
	}
	jsdom.env(url,
		["http://code.jquery.com/jquery.js"],
		function (errors, window) {
			if (errors) {
				console.error("error parsing url", errors);
				return;
			}
			if (undefined === MOEPARSER.contents[url]) {
				MOEPARSER.contents[url] = new Object();
			}
			MOEPARSER.contents[url].name = MOEPARSER.parseDom(window, "#firstHeading > span");
			if (undefined === MOEPARSER.contents[url].name) {
				console.warn(window.$("p").html());
				return;
			}
			MOEPARSER.contents[url].first = MOEPARSER.parseDom(window, "#mw-content-text > p:nth-child(4)");
			MOEPARSER.contents[url].links = new Array();
			window.$("#mw-content-text a").each(function () {
				MOEPARSER.contents[url].links.push(window.$(this).attr("href"));
			});
			//#mw-content-text > div.infotemplatebox > table > tbody > tr:nth-child(1) > td > a > img
			MOEPARSER.contents[url].photo = window.$("#mw-content-text > div.infotemplatebox > table > tr:nth-child(1) > td > a > img").attr('src');
			MOEPARSER.contents[url].info = new Object();
			var info = window.$("#mw-content-text > div.infotemplatebox > table > tr");
			info.each(function (index, value) {
				var key = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > th').text();
				key = key.replace(/\s/g, '');
				if (undefined !== key && "" != key && " " != key) {
					var content = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > td').text();
					content = content.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
					MOEPARSER.contents[url].info[key] = content;
				}
			});
			MOEPARSER.contents[url].categories = new Array();
			var category = window.$("#mw-normal-catlinks > ul > li");
			category.each(function (index, value) {
				var text = window.$(this).text();
				text = text.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
				MOEPARSER.contents[url].categories.push(text);
			});

			var filename = MOEPARSER.contents[url].name; //.replace(/[^a-z0-9]/gi, '_').toLowerCase();
			filename = 'data/raw/' + filename + '.json';
			fs.writeFile(filename, JSON.stringify(MOEPARSER.contents[url], null, 4), function (err) {
				if (err) {
					console.log("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
			console.log(MOEPARSER.contents[url].name, MOEPARSER.contents[url].info);
		}
	);
};
MOEPARSER.parseDom = function (window, selector) {
	return window.$(selector).html();
};
MOEPARSER.parseDomAll = function (window, selector) {
	var ret = new Array();
	window.$(selector).each(function () {
		ret.push(window.$(this).html());
	});
	return ret;
}
MOEPARSER.separate = function () {
	var json = require('../data/raw.json');
	var count = 0;
	for (var i in json) {
		++ count;
		if ("object" == typeof json[i] && ("name" in json[i])) {
			var filename = json[i].name;
			filename = 'data/raw/' + filename + '.json';
			fs.writeFile(filename, JSON.stringify(json[i], null, 4), function (err) {
				if (err) {
					console.log("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
		}
	}
	console.log(count);
}

MOEPARSER.parse();
