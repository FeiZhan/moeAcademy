// moegirl battle

var MOEBATTLE = MOEBATTLE || new Object();
MOEBATTLE.config = {
	files: ['data/cards.json'],
	canvas: undefined,
};
// initialize by loading json files
MOEBATTLE.init = function () {
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
	// load json files
	for (var i in MOEBATTLE.config.files) {
		loadJson(MOEBATTLE.config.files[i], function (data) {
			MOEBATTLE.cards = MOEBATTLE.cards.concat(data);
		});
	}
};
// init when page loaded
$(function() {
	MOEBATTLE.init();
});
// main function
MOEBATTLE.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEBATTLE.config.canvas = canvas;
	MOEBATTLE.showFrame();
	MOEBATTLE.waitLoad();
};
// wait for loading files
MOEBATTLE.waitLoad = function () {
	if ((typeof MOEBATTLE.cards != "array" && typeof MOEBATTLE.cards != "object") || MOEBATTLE.cards.length == 0) {
		console.log("loading");
		setTimeout(MOEBATTLE.waitLoad, 300);
		return;
	}
	MOEBATTLE.startGame();
};
// show the framework
MOEBATTLE.showFrame = function () {
	var canvas = $("#" + MOEBATTLE.config.canvas);
	// clear the canvas
	canvas.empty();
	// append table
	canvas.append($('<div class="id-table"></div>'));
	$("#" + MOEBATTLE.config.canvas + ' .id-table').droppable({
		drop: function( event, ui ) {
			var card;
			$($(ui.draggable[0]).attr('class').split(' ')).each(function (i, val) {
				if (val.substring(0, 7) == "id-card") {
					card = val.substring(7);
				}
			});
			MOEBATTLE.useCard(0, card);
		}
    });
	// append my area and your area
	canvas.append($('<div class="id-myarea area"><a href="#" class="id-endbutton button">结束</a></div>')).append($('<div class="id-yourarea area"></div>'));
	$("#" + MOEBATTLE.config.canvas + ' .id-myarea').droppable({
		drop: function( event, ui ) {
		}
    });
	// append my area and your area
	canvas.append($('<div class="id-myusearea usearea"></div>')).append($('<div class="id-yourusearea usearea"></div>'));
	$("#" + MOEBATTLE.config.canvas + ' .id-endbutton').click(MOEBATTLE.nextPlayer);
	canvas.append($('<div class="id-anime"><img src="#" alt="anime" class="" /></div>'));
	$("#" + MOEBATTLE.config.canvas + " .id-anime img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
};
MOEBATTLE.game = {
	orders: [0, 1],
	deck: new Array(),
	discard: new Array(),
	round_count: 0,
	shuffle_count: 0,
	current: -1,
};
MOEBATTLE.cards = new Array();
MOEBATTLE.players = [
	{
		name: "me",
		order: 0,
		hands: [],
		use: [],
	}, {
		name: "opponent",
		order: 1,
		hands: [],
		use: [],
	}
];
MOEBATTLE.startGame = function () {
	for (var i in MOEBATTLE.cards) {
		MOEBATTLE.game.deck.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);
	MOEBATTLE.shuffle(MOEBATTLE.game.orders);
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.players[i].order = MOEBATTLE.game.orders[i];
	}
	for (var i in MOEBATTLE.game.orders) {
		MOEBATTLE.dealCards(0, MOEBATTLE.game.orders[i]);
	}
	MOEBATTLE.nextPlayer();
};
MOEBATTLE.nextPlayer = function () {
	++ MOEBATTLE.game.current;
	if (MOEBATTLE.game.current >= MOEBATTLE.players.length) {
		MOEBATTLE.game.current %= MOEBATTLE.players.length;
		++ MOEBATTLE.game.round_count;
	}
	MOEBATTLE.dealCards(1, MOEBATTLE.game.orders[MOEBATTLE.game.current]);
};
// shuffle array
MOEBATTLE.shuffle = function (arr) {
	//console.log(arr);
	for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
	{}
	//console.log(arr);
};
MOEBATTLE.dealCards = function (num, player) {
	if (num <= 0 || num >= MOEBATTLE.game.deck.length || player < 0 || player >= MOEBATTLE.players.length) {
		return;
	}
	for (var i = 0; i < num; ++ i) {
		var card = MOEBATTLE.game.deck.pop();
		MOEBATTLE.players[player].hands.push(card);
		$("#" + MOEBATTLE.config.canvas).append('<div class="id-card' + card + ' card deck"><span></span><img src="" alt="card" class="" /></div>');
		$("#" + MOEBATTLE.config.canvas + " .id-card" + card).draggable();
		$("#" + MOEBATTLE.config.canvas + " .id-card" + card + " span").html(MOEBATTLE.cards[card].name);
		$("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
			top: "70%",
			left: "45%",
		}, "slow", function () {
			$(this).removeClass("deck").addClass("myhand");
			MOEBATTLE.obtainCard(card);
		});
	}
};
MOEBATTLE.obtainCard = function (card) {
}
MOEBATTLE.useCard = function (from, card, to) {
	var index = MOEBATTLE.players[from].hands.indexOf(card);
	if (index > -1) {
		MOEBATTLE.players[from].hands.splice(index, 1);
	}
	switch(MOEBATTLE.cards[card].type) {
	case "character":
		MOEBATTLE.addToUseArea(card, from);
		break;
	default:
		$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
			top: '-=30px',
			left: '-=30px',
			height: '+=60px',
			width: '+=60px',
		}, "slow", function () {
			$(this).fadeOut("slow", function () {
				$(this).remove();
				MOEBATTLE.game.discard.push(card);
				var ran = Math.floor( (Math.random() * 6) + 1 );
				$("#" + MOEBATTLE.config.canvas + ' .id-anime img').attr("src", "resources/senjougahara-hitagi/" + ran + ".gif");
				$("#" + MOEBATTLE.config.canvas + ' .id-anime').addClass("active").fadeIn("fast").show();
				setTimeout(function () {
					$("#" + MOEBATTLE.config.canvas + ' .id-anime').fadeOut("slow", function () {
						$(this).removeClass("active");
					});
				}, 3000);
			});
		});
		break;
	}
}
MOEBATTLE.addToUseArea = function (card, player) {
	var height = $("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").height();
	var width = $("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").width();
	if (height > 60) {
		width *= 60 / height;
		height = 60;
	}
	if (width > 60) {
		height *= 60 / width;
		width = 60;
	}
	if (height < 10) {
		height = 10;
	}
	if (width < 10) {
		width = 10;
	}
	$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
		top: "50%",
		left: "45%",
		height: height + "px",
		width: width + "px",
	}, "slow", function () {
		$(this).remove();
		$("#" + MOEBATTLE.config.canvas + ' .id-myusearea').append('<div class="id-icon' + card + ' icon myuse" style="height: ' + height + 'px; width: ' + width + 'px;"><span></span><img src="" alt="icon" class="" /></div>');
		$("#" + MOEBATTLE.config.canvas + " .id-icon" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		var timer, degree = 0;
		var rotate = function (obj) {
			$(obj).css({ WebkitTransform: 'rotate(' + degree + 'deg)' });
			$(obj).css({ '-moz-transform': 'rotate(' + degree + 'deg)' });
			timer = setTimeout(function () {
				++ degree; rotate(obj);
			}, 5);
		}
		$("#" + MOEBATTLE.config.canvas + " .id-icon" + card).hover(function (obj) {
				rotate(obj.currentTarget);
			}, function (obj) {
				clearTimeout(timer);
				degree = 0;
				$(obj.currentTarget).css({ WebkitTransform: 'rotate(0deg)' });
				$(obj.currentTarget).css({ '-moz-transform': 'rotate(0deg)' });
		});
		$("#" + MOEBATTLE.config.canvas + ' .id-icon' + card).hide().css({visibility: "inherit"}).fadeIn("fast");
	});
};











