var MOEPROJECT = MOEPROJECT || new Object();
MOEPROJECT.config = {
	files: ['data/moegirls.json'],
	canvas: undefined,
	show_detail: false
};
// initialize by loading json files
MOEPROJECT.init = function () {
	function loadJson(file, func) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			console.log("loaded", file);
			if (typeof func == "function") {
				func(data);
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("data load error", textStatus, errorThrown);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	// load card files
	for (var i in MOEPROJECT.config.files) {
		loadJson(MOEPROJECT.config.files[i], function (data) {
			MOEPROJECT.moegirls = MOEPROJECT.moegirls.concat(data);
		});
	}
};
// init when page loaded
$(function() {
	MOEPROJECT.init();
});
MOEPROJECT.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEPROJECT.config.canvas = canvas;
	MOEPROJECT.showFrame();
	MOEPROJECT.waitLoad();
};
// wait for loading json
MOEPROJECT.waitLoad = function () {
	if (0 == MOEPROJECT.moegirls.length) {
		console.log("loading");
		setTimeout(MOEPROJECT.waitLoad, 300);
		return;
	}
	for (var i = 0; i < 15; ++ i) {
		MOEPROJECT.addMoegirl();
	}
};
MOEPROJECT.showFrame = function () {
	MOEPROJECT.order = new Array();
	var html = 
	'<div id="wrapper">'
		+ '<div id="columns">'
		+ '</div>'
	+ '</div>'
	+ '<div id="detail"><a href="#" class="id-pagelink pagelink" target="_blank"><img border="0" src="resources/nophoto.jpg" alt="photo" width="100%" class="id-photo photo" /></a><table class="" border="0"></table></div>';
	$("#" + MOEPROJECT.config.canvas).append(html);
	$("#" + MOEPROJECT.config.canvas + " #detail").click(function( event ) {
		event.stopPropagation();
	});
	$('html').click(function (evt) {
		switch (MOEPROJECT.config.show_detail) {
		case true:
			if (evt.target.id != "detail") {
				$("#" + MOEPROJECT.config.canvas + " #detail").hide();
				$("#" + MOEPROJECT.config.canvas + " #columns .pin").removeClass("opaque");
				MOEPROJECT.config.show_detail = false;
			}
			break;
		case false:
			break;
		case "showing":
			MOEPROJECT.config.show_detail = true;
			break;
		default:
			break;
		}
	});
	$(window).scroll(function() {
		clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			if ($(window).scrollTop() == ($(document).height() - $(window).height())) {
				for (var i = 0; i < 10; ++ i) {
					MOEPROJECT.addMoegirl();
				}
			}
		}, 250));
	});
}
MOEPROJECT.moegirls = new Array();
MOEPROJECT.order = new Array();
MOEPROJECT.addMoegirl = function () {
	var ran = Math.floor( Math.random() * MOEPROJECT.moegirls.length );
	var html =
		'<div class="pin">'
			+ '<img src="' + MOEPROJECT.moegirls[ran].photo + '" />'
			+ '<p>' + MOEPROJECT.moegirls[ran].name + '</p>'
		+ '</div>';
	$("#" + MOEPROJECT.config.canvas + " #columns").append(html);
	if (true == MOEPROJECT.config.show_detail) {
		$("#" + MOEPROJECT.config.canvas + " #columns .pin:last").addClass("opaque");
	}
	MOEPROJECT.order.push(ran);
	$("#" + MOEPROJECT.config.canvas + " #columns .pin:last").click(function () {
		MOEPROJECT.config.show_detail = "showing";
		var moegirl = MOEPROJECT.moegirls[MOEPROJECT.order[$(this).prevAll().length]];
		MOEPROJECT.showDetail(moegirl);
	});
}
MOEPROJECT.showDetail = function (moegirl) {
	$("#" + MOEPROJECT.config.canvas + " #columns .pin").addClass("opaque");
	var table = $("#" + MOEPROJECT.config.canvas + " #detail table");
	table.empty();
	table.append($('<tr><th class="id-th0"></th><th class="id-th1"></th></tr>'));
	// clear link and photo
	$("#" + MOEPROJECT.config.canvas + " .id-pagelink").attr("href", "#");
	$("#" + MOEPROJECT.config.canvas + " .id-photo").attr("src", "resources/nophoto.jpg");
	// for each attribute
	for (var i in moegirl) {
		// append photo
		if ("photo" == i) {
			$("#" + MOEPROJECT.config.canvas + " .id-photo").attr("src", moegirl["photo"]);
		}
		// append link
		else if ("link" == i) {
			$("#" + MOEPROJECT.config.canvas + " .id-pagelink").attr("href", moegirl["link"]);
		}
		else if ("firstp" == i || "catlinks" == i) {
			// ignore
		} else { // append an attribute
			var th = i;
			if ("name" == th) {
				th = "名字";
			}
			var td = moegirl[i];
			// stringify a json
			if (typeof moegirl[i] == "array" || typeof moegirl[i] == "object") {
				td = JSON.stringify(moegirl[i]);
			}
			// if too long
			if (td.length > 30) {
				//td = td.substring(0, 30) + "...";
			}
			table.append($('<tr><td>' + th + '</td><td>' + td + '</td></tr>'));
		}
	}
	$("#" + MOEPROJECT.config.canvas + " #detail").hide().css({visibility: "inherit"}).fadeIn("slow");
}
