// moeproject parser

var MOEPROJ = MOEPROJ || new Object();
var MOEPARSER = MOEPROJ.MOEPARSER || new Object();

var jsdom = require("jsdom");
MOEPARSER.ENTRY_URL = [
"http://zh.moegirl.org/%E8%B4%BE%E5%85%8B%E4%B8%9D",
//"http://zh.moegirl.org/Mainpage",
//"file:///var/www/moeproject/resources/%E5%8D%83%E7%9F%B3%E6%8A%9A%E5%AD%90%20-%20%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_%E4%B8%87%E7%89%A9%E7%9A%86%E5%8F%AF%E8%90%8C%E7%9A%84%E7%99%BE%E7%A7%91%E5%85%A8%E4%B9%A6.html",
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
			MOEPARSER.contents[url].name = MOEPARSER.parseDom(window, "p");
			console.log(MOEPARSER.contents);
		}
	);
};
MOEPARSER.parseDom = function (window, selector, max_num) {
	var dom = window.$(selector);
	if (undefined === max_num) {
		return dom.html();
	}
	else {
		var ret = new Array();
		for (var i = 0; i < dom.length && i <= max_num; ++ i) {
			ret.push(dom[i].html());
		}
		return ret;
	}
};

MOEPARSER.parse();
