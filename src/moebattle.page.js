// moegirl battle frontpage

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
MOEPROJ.MOEBATTLE.PAGE = MOEPROJ.MOEBATTLE.PAGE || new Object();
var MOEPAGE = MOEPROJ.MOEBATTLE.PAGE;

MOEPAGE.html0 = ' \
<div id="boardlist"> \
<span>Select your game</span> \
	<ul> \
	</ul> \
</div> \
<div id="boardinfo"> \
	<h2></h2> \
	<div /> \
</div> \
<input type="text" name="customboard" id="customboard" /> \
<button type="button" id="selectboard">Select</button> \
<button type="button" id="backboard">Back</button> \
';
MOEPAGE.data = ['data/board.json'];
MOEPAGE.load = function (canvas) {
	document.title = "萌娘对战";
	$("#" + canvas).addClass("moebattle");
	MOEPROJ.load({
		canvas: canvas,
		html: MOEPAGE.html0,
		data: MOEPAGE.data,
		menubar: false,
	}, MOEPAGE.run0, MOEPAGE.loadData);
};
// callback for loading json data
MOEPAGE.loadData = function (data, file) {
	switch (file) {
	case 'data/board.json':
		if (! ("board" in data)) {
			return;
		}
		for (var i in data.board) {
			MOEPAGE.BoardList[ data.board[i] ] = new Object();
			MOEPROJ.loadJson(data.board[i], function (data, file) {
				MOEPAGE.BoardList[file] = data;
				var name = MOEPAGE.BoardList[ file ].name;
				if (undefined === name || "" == name) {
					name = file;
				}
				$("#" + MOEPROJ.config.canvas + ' #boardlist ul').append('<li id="' + file + '">' + name + "</li>");
			});
		}
		break;
	default:
		MOEPAGE.BoardConfig = data;
		break;
	}
};
// system data
MOEPAGE.BoardList = new Object();
MOEPAGE.BoardSelect;

// run when loading completes
MOEPAGE.run0 = function () {
	$("#" + MOEPROJ.config.canvas + ' #boardlist li').hover(function () {
		var file = $(this).attr("id");
		if (undefined !== file && "" != file) {
			$("#" + MOEPROJ.config.canvas + ' #boardinfo h2').html(MOEPAGE.BoardList[file].name);
			$("#" + MOEPROJ.config.canvas + ' #boardinfo div').html(MOEPAGE.BoardList[file].discrip);
		} else {
			$("#" + MOEPROJ.config.canvas + ' #boardinfo h2').html( $(this).html() );
		}
	}, function () {
		if (! $(this).hasClass("active")) {
			$("#" + MOEPROJ.config.canvas + ' #boardinfo h2').html("");
			$("#" + MOEPROJ.config.canvas + ' #boardinfo div').html("");
		}
	})
	.click(function () {
		$("#" + MOEPROJ.config.canvas + ' #boardlist li').removeClass("active");
		$(this).addClass("active");
	});
	$("#" + MOEPROJ.config.canvas + ' #customboard').click(function () {
		console.log("supposed to load file", $(this).val());
	});
	$("#" + MOEPROJ.config.canvas + ' #selectboard').click(function () {
		MOEPAGE.BoardSelect = $("#" + MOEPROJ.config.canvas + ' #boardlist li.active').attr("id");
		if (undefined !== MOEPAGE.BoardSelect && "" != MOEPAGE.BoardSelect) {
			MOEPROJ.load({
				html: MOEPAGE.html1,
				menubar: false,
			}, MOEPAGE.run1, MOEPAGE.loadData);
		}
	});
	$("#" + MOEPROJ.config.canvas + ' #backboard').click(function () {
		window.location.href = "index.html";
	});
};

MOEPAGE.html1 = ' \
<div id="boardinfo1"> \
	<h2></h2> \
	<span /> \
</div> \
<div id="playerlist"> \
</div> \
<button type="button" id="startboard">Start</button> \
<button type="button" id="backboard1">Back</button> \
';

MOEPAGE.run1 = function () {
	$("#" + MOEPROJ.config.canvas + ' #backboard1').click(function () {
		MOEPAGE.load(MOEPROJ.config.canvas);
	});
	$("#" + MOEPROJ.config.canvas + ' #boardinfo1 h2').html(MOEPAGE.BoardList[MOEPAGE.BoardSelect].name);
	$("#" + MOEPROJ.config.canvas + ' #boardinfo1 span').html(MOEPAGE.BoardList[MOEPAGE.BoardSelect].discrip);
	if ("player_num" in MOEPAGE.BoardList[MOEPAGE.BoardSelect]) {
		var html = ' \
<div> \
	<img src="resources/moegirlpedia/photo.jpg" alt="player photo" /> \
	<select> \
		<option value="empty">Empty</option> \
		<option value="player0">玩家</option> \
	</select> \
	<div /> \
</div> \
		';
		var player_num = parseInt(MOEPAGE.BoardList[MOEPAGE.BoardSelect].player_num);
		for (var i = 0; i < player_num; ++ i) {
			$("#" + MOEPROJ.config.canvas + ' #playerlist').append(html);
		}
		$("#" + MOEPROJ.config.canvas + ' #playerlist img').error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		if (player_num > 0) {
			$("#" + MOEPROJ.config.canvas + ' #playerlist>div:first-child select option[value="player0"]').attr("selected", true);
		}
	}
	$("#" + MOEPROJ.config.canvas + ' #startboard').click(function () {
		MOEBATTLE.load(MOEPROJ.config.canvas);
	});
};

































