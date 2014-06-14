// moeproject parser

var MOEPROJ = MOEPROJ || new Object();
var MOEPARSER = MOEPROJ.MOEPARSER || new Object();

var fs = require('fs');
var jsdom = require("jsdom");
MOEPARSER.PROJ_ROOT = '../';
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
// parse all specified pages
MOEPARSER.parse = function () {
	for (var i in MOEPARSER.ENTRY_URL) {
		MOEPARSER.parsePage(MOEPARSER.ENTRY_URL[i]);
	}
};
// parse one page, save to json format
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
			// create a key for the new url
			if (undefined === MOEPARSER.contents[url]) {
				MOEPARSER.contents[url] = new Object();
			}
			// moegirl's name
			MOEPARSER.contents[url].name = MOEPARSER.parseDom(window, "#firstHeading > span");
			// get error from the webpage
			if (undefined === MOEPARSER.contents[url].name) {
				console.warn(window.$("p").html());
				return;
			}
			// first line
			MOEPARSER.contents[url].first = MOEPARSER.parseDom(window, "#mw-content-text > p:nth-child(4)");
			// all the links in the content
			MOEPARSER.contents[url].links = new Array();
			window.$("#mw-content-text a").each(function () {
				MOEPARSER.contents[url].links.push(window.$(this).attr("href"));
			});
			// photo
			//#mw-content-text > div.infotemplatebox > table > tbody > tr:nth-child(1) > td > a > img
			MOEPARSER.contents[url].photo = window.$("#mw-content-text > div.infotemplatebox > table > tr:nth-child(1) > td > a > img").attr('src');
			// info table
			MOEPARSER.contents[url].info = new Object();
			var info = window.$("#mw-content-text > div.infotemplatebox > table > tr");
			info.each(function (index, value) {
				// key on the left
				var key = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > th').text();
				// remove invalid symbols
				key = key.replace(/\s/g, '');
				if (undefined !== key && "" != key && " " != key) {
					// content on the right
					var content = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > td').text();
					// remove invalid symbols
					content = content.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
					MOEPARSER.contents[url].info[key] = content;
				}
			});
			// category
			MOEPARSER.contents[url].categories = new Array();
			var category = window.$("#mw-normal-catlinks > ul > li");
			category.each(function (index, value) {
				var text = window.$(this).text();
				// remove invalid symbols
				text = text.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
				MOEPARSER.contents[url].categories.push(text);
			});
			// filename based on moegirl's name
			var filename = MOEPARSER.contents[url].name; //.replace(/[^a-z0-9]/gi, '_').toLowerCase();
			filename = 'data/raw/' + filename + '.json';
			// write json to file
			fs.writeFile(filename, JSON.stringify(MOEPARSER.contents[url], null, 4), function (err) {
				if (err) {
					console.error("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
			//console.info(MOEPARSER.contents[url].name, MOEPARSER.contents[url].info);
		}
	);
};
// parse an element in the DOM
MOEPARSER.parseDom = function (window, selector) {
	return window.$(selector).html();
};
// return all the elements for the selector in the DOM
MOEPARSER.parseDomAll = function (window, selector) {
	var ret = new Array();
	window.$(selector).each(function () {
		ret.push(window.$(this).html());
	});
	return ret;
}
// separate the raw data into each moegirl
MOEPARSER.separate = function () {
	// open json file
	var json = require('../data/raw.json');
	var count = 0;
	for (var i in json) {
		++ count;
		if ("object" == typeof json[i] && ("name" in json[i])) {
			// new file name
			var filename = json[i].name;
			filename = 'data/raw/' + filename + '.json';
			// write json to file
			fs.writeFile(filename, JSON.stringify(json[i], null, 4), function (err) {
				if (err) {
					console.error("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
		}
	}
	console.info(count);
}
// change photo path to the current one
MOEPARSER.changePhoto = function () {
	// get file name list
	MOEPARSER.eachFile("data/raw/", function (err, files) {
		// for each moegirl file
		for (var i in files) {
			// try to load the json file
			try {
				var json = require("../" + files[i]);
			}
			catch (err) {
				//@bug usually error
				//console.error("require error:", err);
				continue;
			}
			// if no photo
			if (! ("photo" in json)) {
				continue;
			}
			// if no old photo, copy current one to old. if have old photo, don't do twice
			if (! ("old_photo" in json)) {
				json.old_photo = json.photo;
			}
			// modify the photo file path
			json.photo = json.old_photo.replace("1-ps.googleusercontent.com/x/zh.moegirl.org/", "").replace("static.mengniang.org/thumb", "static.mengniang.org/common/thumb");
			var end = json.photo.indexOf(".pagespeed");
			if (end >= 0) {
				json.photo = json.photo.substr(0, end);
			}
			var name0 = json.photo.indexOf(".jpg/");
			var name1 = json.photo.indexOf("250px-");
			var remove = json.photo.substring(name0 + 5, name1);
			json.photo = json.photo.replace(remove, "");
			//console.info(json.photo, " === ", json.old_photo);
			// write it back
			fs.writeFile(files[i], JSON.stringify(json, null, 4), function (err) {
				if (err) {
					//console.error("file error", err);
				} else {
					//console.log("JSON saved to " + files[i]);
				}
			}); 
		}
	});
};
// put moegirl file paths into filenames.json
MOEPARSER.saveFileNames = function () {
	var path = MOEPARSER.PROJ_ROOT + "data/raw/";
	MOEPARSER.eachFile(path, function (err, files) {
		for (var i in files) {
			files[i] = files[i].substr(path.length);
		}
		// write them back
		fs.writeFile(MOEPARSER.PROJ_ROOT + "data/filenames.json", JSON.stringify(files, null, 4), function (err) {
			if (err) {
				console.error("file error", err);
			} else {
				console.log("JSON saved to ", MOEPARSER.PROJ_ROOT + "data/filenames.json");
			}
		});
	});
};
// return a list of file names
MOEPARSER.eachFile = function (path, callback) {
 // the callback gets ( err, files) where files is an array of file names
 if( typeof callback !== 'function' ) return
 var
  result = []
  , files = [ path.replace( /\/\s*$/, '' ) ]
 function traverseFiles (){
  if( files.length ) {
   var name = files.shift()
   fs.stat(name, function( err, stats){
	if( err ){
	 if( err.errno == 34 ) traverseFiles()
// in case there's broken symbolic links or a bad path
// skip file instead of sending error
	 else callback(err)
	}
	else if ( stats.isDirectory() ) fs.readdir( name, function( err, files2 ){
	 if( err ) callback(err)
	 else {
	  files = files2
	   .map( function( file ){ return name + '/' + file } )
	   .concat( files )
	  traverseFiles()
	 }
	})
	else{
	 result.push(name)
	 traverseFiles()
	}
   })
  }
  else callback( null, result )
 }
 traverseFiles()
}


//MOEPARSER.parse();
//MOEPARSER.changePhoto();
MOEPARSER.saveFileNames();
