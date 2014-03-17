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
	// load card files
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
	// append board
	canvas.append($('<div class="id-board"></div>'));
	// drop callback for board
	$("#" + MOEBATTLE.config.canvas + ' .id-board').droppable({
		drop: function( event, ui ) {
			var card;
			// get card id
			$($(ui.draggable[0]).attr('class').split(' ')).each(function (i, val) {
				if (val.substring(0, 7) == "id-card") {
					card = val.substring(7);
				}
			});
			MOEBATTLE.dropCard(card);
		}
    });
	// append my hand and your hand
	canvas.append($('<div class="id-myhand hand"><a href="#" class="id-endbutton button">结束</a></div>')).append($('<div class="id-yourhand hand"></div>'));
	// drop event for myhand
	$("#" + MOEBATTLE.config.canvas + ' .id-myhand').droppable({
		drop: function( event, ui ) {
		}
    });
	// append my area and your area
	canvas.append($('<div class="id-myarea area"></div>')).append($('<div class="id-yourarea area"></div>'));
	// anime canvas
	canvas.append($('<div class="id-anime"><img src="#" alt="anime" class="" /></div>'));
	$("#" + MOEBATTLE.config.canvas + " .id-anime img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// detail canvas
	canvas.append($('<div class="id-detail"><div class="name"></div><img src="#" alt="photo" class="" /><div class="detail"></div></div>'));
	$("#" + MOEBATTLE.config.canvas + " .id-detail img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("html").mousedown(MOEBATTLE.hideDetail).mousemove(MOEBATTLE.hideDetail).click(MOEBATTLE.hideDetail);
	// arrow canvas
	canvas.append($('<div class="id-arrow"><canvas class="id-arrowcanvas" /></div>'));
	var arrow = document.getElementsByClassName('id-arrowcanvas')[0].getContext('2d');
	// draw an arrow
	arrow.fillStyle = 'yellow';
	arrow.beginPath();
	arrow.moveTo(150, 0);
	arrow.lineTo(0, 45);
	arrow.lineTo(100, 45);
	arrow.lineTo(100, 150);
	arrow.lineTo(200, 150);
	arrow.lineTo(200, 45);
	arrow.lineTo(300, 45);
	arrow.closePath();
	arrow.fill();
};
MOEBATTLE.game = {
	// orders for each player
	orders: [0, 1],
	// cards in deck
	deck: new Array(),
	// cards in discard deck
	discard: new Array(),
	round_count: 0,
	shuffle_count: 0,
	// current player
	current: -1,
};
MOEBATTLE.cards = new Array();
MOEBATTLE.players = [
	{
		name: "me",
		order: 0,
		hands: [],
		area: [],
	}, {
		name: "opponent",
		order: 1,
		hands: [],
		area: [],
	}
];
// game start
MOEBATTLE.startGame = function () {
	MOEBATTLE.game.discard = new Array();
	// shuffle cards in deck
	MOEBATTLE.game.deck = new Array();
	for (var i in MOEBATTLE.cards) {
		MOEBATTLE.game.deck.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);
	// shuffle player orders
	MOEBATTLE.game.orders = new Array();
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.game.orders.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.orders);
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.players[i].order = MOEBATTLE.game.orders[i];
	}
	// deal initial cards
	for (var i in MOEBATTLE.game.orders) {
		MOEBATTLE.dealCards(1, MOEBATTLE.game.orders[i]);
	}
	// the first player
	setTimeout(MOEBATTLE.nextPlayer, 500);
};
// shuffle array
MOEBATTLE.shuffle = function (arr) {
	//console.log(arr);
	for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
	{}
	//console.log(arr);
};
// switch to next player
MOEBATTLE.nextPlayer = function () {
	$("#" + MOEBATTLE.config.canvas + ' .id-endbutton').off("click", MOEBATTLE.nextPlayer);
	$("#battle .turn").removeClass("turn").css("border-color", "#98bf21");
	// add current player number by one
	++ MOEBATTLE.game.current;
	if (MOEBATTLE.game.current >= MOEBATTLE.players.length) {
		MOEBATTLE.game.current %= MOEBATTLE.players.length;
		++ MOEBATTLE.game.round_count;
	}
	// change border color
	if (0 == MOEBATTLE.game.current) {
		$("#battle .id-myhand").addClass("turn").css("border-color", "red");
	} else {
		$("#battle .id-yourhand").addClass("turn").css("border-color", "red");
	}
	MOEBATTLE.dealCards(1, MOEBATTLE.game.current);
    // click event for endbutton
	$("#" + MOEBATTLE.config.canvas + ' .id-endbutton').on("click", MOEBATTLE.nextPlayer);
};
// deal cards to a player
MOEBATTLE.dealCards = function (num, player) {
	// invalid
	if (num <= 0 || player < 0 || player >= MOEBATTLE.players.length) {
		return;
	}
	if (num > MOEBATTLE.game.deck.length) {
		MOEBATTLE.shuffle(MOEBATTLE.game.discard);
		MOEBATTLE.game.deck = MOEBATTLE.game.deck.concat(MOEBATTLE.game.discard);
		MOEBATTLE.game.discard = new Array();
		++ MOEBATTLE.game.shuffle_count;
	}
	if (num > MOEBATTLE.game.deck.length) {
		console.log("game over");
		return;
	}
	// for each card
	for (var i = 0; i < num; ++ i) {
		// get a card from deck
		var card = MOEBATTLE.game.deck.pop();
		// give to a player
		MOEBATTLE.players[player].hands.push(card);
		// create a card in deck
		var card_jquery = MOEBATTLE.createCard(card);
		var top = "70%", left = "45%";
		if (0 == player) {
			top = "70%", left = "45%";
		} else {
			top = "5%", left = "45%";
		}
		// move to player's hand
		card_jquery.addClass("deck").animate({
			top: top,
			left: left,
		}, "slow", function () {
			// put inside myhand canvas
			if (0 == player) {
				$("#" + MOEBATTLE.config.canvas + " .id-myhand").append($(this).detach());
				$(this).removeClass("deck").addClass("inhand");
			} else { // put inside yourhand canvas
				$("#" + MOEBATTLE.config.canvas + " .id-yourhand").append($(this).detach());
				$(this).removeClass("deck").addClass("inhand inyourhand");
			}
			// float to left
			$(this).css({
				top: "0px",
				left: "0px"
			});
		});
	}
};
// use a card
MOEBATTLE.useCard = function (from, card, to) {
	// remove card from player
	MOEBATTLE.players[from].hands.splice(MOEBATTLE.players[from].hands.indexOf(card), 1);
	switch(MOEBATTLE.cards[card].type) {
	case "character": // put into player's area
		MOEBATTLE.addToArea(card, from);
		break;
	default: // use immediately
		MOEBATTLE.game.discard.push(card);
		// expand and disappear
		$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
			top: '-=100px',
			left: '-=100px',
			height: '+=200px',
			width: '+=200px',
			opacity: 0,
		}, "slow", function () {
			$(this).remove();
			MOEBATTLE.skillAnimate(card, "");
		});
		break;
	}
}
// add a card to player's area
MOEBATTLE.addToArea = function (card, player) {
	MOEBATTLE.players[player].area.push(card);
	// shrink to image size
	var height = $("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").height();
	var width = $("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").width();
	// fit to max-, min-height, width
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
	// move to player's area
	$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
		top: "50%",
		left: "45%",
		height: height + "px",
		width: width + "px",
	}, "slow", function () {
		$(this).remove();
		// add an icon in area
		MOEBATTLE.createIcon(card, height, width);
		MOEBATTLE.skillAnimate(card, "skill0");
	});
};
// drop a card into board
MOEBATTLE.dropCard = function (card) {
	// put out of myhand canvas
	var card_jq = $("#" + MOEBATTLE.config.canvas + " .id-card" + card);
	var top = card_jq.position().top + card_jq.parent().position().top;
	var left = card_jq.position().left + card_jq.parent().position().left;
	$("#" + MOEBATTLE.config.canvas).append(card_jq.detach());
	card_jq.removeClass("myhand");
	card_jq.css({
		top: top,
		left: left
	});
	// if having target
	if (undefined !== MOEBATTLE.cards[card].target) {
		// card center position
		var y = $("#" + MOEBATTLE.config.canvas + " .id-card" + card).position().top + 80;
		var x = $("#" + MOEBATTLE.config.canvas + " .id-card" + card).position().left + 60;
		// draw an arrow following mouse
		var arrowFollow = function (event) {
			var dist = Math.sqrt((event.pageX - x) * (event.pageX - x) + (event.pageY - y) * (event.pageY - y));
			var newx = (event.pageX + x) / 2 - 25;
			var newy = (event.pageY + y) / 2 - dist / 2;
			// the length is the dist
			$("#" + MOEBATTLE.config.canvas + " .id-arrow").height(dist);
			var angle = Math.atan2(event.pageY - y, event.pageX - x) * 180 / Math.PI + 90;
			$("#" + MOEBATTLE.config.canvas + " .id-arrow").css({
				top: newy,
				left: newx
			})
			.css({visibility: "inherit"}).show()
			// rotate
			.css({ WebkitTransform: 'rotate(' + angle + 'deg)' }).css({ '-moz-transform': 'rotate(' + angle + 'deg)' });
		};
		//@bug change to once?
		// set arrow to follow mouse
		$("html").mousemove(arrowFollow)
		// click anywhere to stop the arrow
		.click(function () {
			// remove arrow
			$("html").off('mousemove', arrowFollow);
			$("#" + MOEBATTLE.config.canvas + " .id-arrow").hide();
			//@todo
			$("#" + MOEBATTLE.config.canvas + ' .id-card' + card).animate({
				top: '-=100px',
				left: '-=100px',
				height: '+=200px',
				width: '+=200px',
				opacity: 0,
			}, "slow", function () {
				$(this).remove();
				MOEBATTLE.game.discard.push(card);
				MOEBATTLE.skillAnimate(card, "");
			});
		});
	} else { // use directly
		MOEBATTLE.useCard(0, card);
	}
}
// animation when creating a card
MOEBATTLE.createCard = function (card) {
	$("#" + MOEBATTLE.config.canvas).append('<div class="id-card' + card + ' card"><span></span><img src="" alt="card" class="" /></div>');
	$("#" + MOEBATTLE.config.canvas + " .id-card" + card).draggable();
	// assign content
	$("#" + MOEBATTLE.config.canvas + " .id-card" + card + " span").html(MOEBATTLE.cards[card].name);
	$("#" + MOEBATTLE.config.canvas + " .id-card" + card + " img").attr("src", MOEBATTLE.cards[card].photo)
	.error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	var timer;
	$("#" + MOEBATTLE.config.canvas + " .id-card" + card).hover(function () {
		// move to front
		$(this).css("z-index", 1);
		// expand
		$(this).animate({ height: "+=20px", width: "+=20px", left: "-=10px", top: "-=10px" }, "fast");
		if (! timer) {
			// show detail after hovering
			timer = setTimeout(function () {
				timer = null;
				MOEBATTLE.showDetail(card);
			}, 1000);
		}
	}, function () {
		// move back
		$(this).css("z-index", 0);
		$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
		// remove timer
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		MOEBATTLE.hideDetail();
	});
	return $("#" + MOEBATTLE.config.canvas + " .id-card" + card);
};
// animation when creating an icon
MOEBATTLE.createIcon = function (card, height, width) {
	$("#" + MOEBATTLE.config.canvas + ' .id-myarea').append('<div class="id-icon' + card + ' icon myuse" style="height: ' + height + 'px; width: ' + width + 'px;"><span></span><img src="" alt="icon" class="" /></div>');
	$("#" + MOEBATTLE.config.canvas + " .id-icon" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	var timer, timer2, degree = 0;
	// rotate when hovering
	var rotate = function (obj) {
		$(obj).css({ WebkitTransform: 'rotate(' + degree + 'deg)' });
		$(obj).css({ '-moz-transform': 'rotate(' + degree + 'deg)' });
		timer = setTimeout(function () {
			++ degree; rotate(obj);
		}, 5);
	}
	$("#" + MOEBATTLE.config.canvas + " .id-icon" + card).hover(function (obj) {
		$(this).css("z-index", 1);
		rotate(obj.currentTarget);
		if (! timer2) {
			// show detail after hovering
			timer2 = setTimeout(function () {
				timer2 = null;
				MOEBATTLE.showDetail(card);
			}, 1000);
		}
	}, function (obj) {
		$(this).css("z-index", 0);
		clearTimeout(timer);
		// move back
		degree = 0;
		$(obj.currentTarget).css({ WebkitTransform: 'rotate(0deg)' });
		$(obj.currentTarget).css({ '-moz-transform': 'rotate(0deg)' });
		if (timer2) {
			clearTimeout(timer2);
			timer2 = null;
		}
	});
	$("#" + MOEBATTLE.config.canvas + ' .id-icon' + card).hide().css({visibility: "inherit"}).fadeIn("fast");
	return $("#" + MOEBATTLE.config.canvas + ' .id-icon' + card);
};
// show detail canvas
MOEBATTLE.showDetail = function (card) {
	$("#" + MOEBATTLE.config.canvas + " .id-detail .name").html(MOEBATTLE.cards[card].name);
	if (undefined !== MOEBATTLE.cards[card].photo) {
		$("#" + MOEBATTLE.config.canvas + " .id-detail img").attr("src", MOEBATTLE.cards[card].photo);
	} else {
		$("#" + MOEBATTLE.config.canvas + " .id-detail img").attr("src", "");
	}
	if (undefined !== MOEBATTLE.cards[card].detail) {
		$("#" + MOEBATTLE.config.canvas + " .id-detail .detail").html(MOEBATTLE.cards[card].detail);
	} else {
		$("#" + MOEBATTLE.config.canvas + " .id-detail .detail").html("");
	}
	$("#" + MOEBATTLE.config.canvas + " .id-detail").hide().css({visibility: "inherit"}).slideDown("slow");
}
// hide detail canvas
MOEBATTLE.hideDetail =function () {
	$("#" + MOEBATTLE.config.canvas + " .id-detail").slideUp('slow', function () {
		$("#" + MOEBATTLE.config.canvas + " .id-detail .name").html("");
		$("#" + MOEBATTLE.config.canvas + " .id-detail .detail").html("");
		$("#" + MOEBATTLE.config.canvas + " .id-detail img").attr("src", "");
	});
}
// animate for a skill
MOEBATTLE.skillAnimate = function (card, skill) {
	// invalid
	if (! (card in MOEBATTLE.cards) || undefined === MOEBATTLE.cards[card].anime || undefined === MOEBATTLE.cards[card].anime[skill]) {
		return;
	}
	var ani_list = MOEBATTLE.cards[card].anime[skill];
	// choose one by random
	var ran = Math.floor( (Math.random() * ani_list.length) );
	$("#" + MOEBATTLE.config.canvas + ' .id-anime img').attr("src", ani_list[ran]);
	$("#" + MOEBATTLE.config.canvas + ' .id-anime').addClass("active").fadeIn("fast").show();
	// disappear after a while
	setTimeout(function () {
		$("#" + MOEBATTLE.config.canvas + ' .id-anime').fadeOut("slow", function () {
			$(this).removeClass("active");
			$("#" + MOEBATTLE.config.canvas + ' .id-anime img').attr("src", "");
		});
	}, 3000);
}










