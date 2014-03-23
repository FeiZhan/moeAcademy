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
	$("#" + canvas).addClass("moebattle");
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
	canvas.append($('<div class="board"></div>'));
	// drop callback for board
	$("#" + MOEBATTLE.config.canvas + ' .board').droppable({
		drop: function( event, ui ) {
			var card;
			// get card id
			$($(ui.draggable[0]).attr('class').split(' ')).each(function (i, val) {
				if (val.length > 4 && val.substring(0, 4) == "card") {
					card = val.substring(4);
				}
			});
			if (undefined !== card) {
				MOEBATTLE.dropCard(card);
			}
		}
    });
	// append my hand and your hand
	canvas.append($('<div class="myhand hand"></div>')).append($('<div class="yourhand hand"></div>')).append($('<a href="#" class="endbutton button">结束</a>'));
	// drop event for myhand
	$("#" + MOEBATTLE.config.canvas + ' .myhand').droppable({
		drop: function( event, ui ) {
		}
    });
	// append my area and your area
	canvas.append($('<div class="myarea area"></div>')).append($('<div class="yourarea area"></div>'));
	// anime canvas
	canvas.append($('<div class="anime"><img src="#" alt="anime" class="" /></div>'));
	$("#" + MOEBATTLE.config.canvas + " .anime img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// detail canvas
	canvas.append($('<div class="detail"><div class="name"></div><div class="cost"></div><div class="def"></div><div class="atk"></div><div class="card-hp"></div><img src="#" alt="photo" class="" /><div class="card-detail"></div></div>'));
	$("#" + MOEBATTLE.config.canvas + " .detail img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	//$("html").mousedown(MOEBATTLE.hideDetail).mousemove(MOEBATTLE.hideDetail).click(MOEBATTLE.hideDetail);
	// arrow canvas
	canvas.append($('<div class="arrow"><canvas class="arrowcanvas" /></div>'));
	var arrow = document.getElementsByClassName('arrowcanvas')[0].getContext('2d');
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
	// hp mp fields
	canvas.append($('<div class="myhp hp"><span>0</span> / <span>0</span></div>')).append($('<div class="yourhp hp"><span>0</span> / <span>0</span></div>'));
	canvas.append($('<div class="mymp mp"><span>0</span> / <span>0</span></div>')).append($('<div class="yourmp mp"><span>0</span> / <span>0</span></div>'));
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
		maxhp: 20,
		hp: 20,
		maxmp: 0,
		mp: 0,
		hands: [],
		area: [],
	}, {
		name: "opponent",
		order: 1,
		maxhp: 20,
		hp: 20,
		maxmp: 0,
		mp: 0,
		hands: [],
		area: [],
	}
];
// game start
MOEBATTLE.startGame = function () {
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.preparePlayer(i);
	}
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
		//MOEBATTLE.dealCards(1, MOEBATTLE.game.orders[i]);
	}
	// the first player
	setTimeout(MOEBATTLE.nextPlayer, 500);
};
MOEBATTLE.preparePlayer = function (player) {
	if (0 == player) {
		var span = $("#" + MOEBATTLE.config.canvas + ' .myhp span');
		$(span[0]).html(MOEBATTLE.players[player].hp);
		$(span[1]).html(MOEBATTLE.players[player].maxhp);
		span = $("#" + MOEBATTLE.config.canvas + ' .mymp span');
		$(span[0]).html(MOEBATTLE.players[player].mp);
		$(span[1]).html(MOEBATTLE.players[player].maxmp);
	}
	else if (1 == player) {
		var span = $("#" + MOEBATTLE.config.canvas + ' .yourhp span');
		$(span[0]).html(MOEBATTLE.players[player].hp);
		$(span[1]).html(MOEBATTLE.players[player].maxhp);
		span = $("#" + MOEBATTLE.config.canvas + ' .yourmp span');
		$(span[0]).html(MOEBATTLE.players[player].mp);
		$(span[1]).html(MOEBATTLE.players[player].maxmp);
	}
}
// shuffle array
MOEBATTLE.shuffle = function (arr) {
	//console.log(arr);
	for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
	{}
	//console.log(arr);
};
// switch to next player
MOEBATTLE.nextPlayer = function () {
	$("#battle .turn").removeClass("turn");
	// add current player number by one
	++ MOEBATTLE.game.current;
	if (MOEBATTLE.game.current >= MOEBATTLE.players.length) {
		MOEBATTLE.game.current %= MOEBATTLE.players.length;
		++ MOEBATTLE.game.round_count;
	}
	// change border color
	if (0 == MOEBATTLE.game.current) {
		$("#battle .myhand").addClass("turn");
	} else {
		$("#battle .yourhand").addClass("turn");
	}
	MOEBATTLE.dealCards(1, MOEBATTLE.game.current);
    // click event for endbutton
	if (0 == MOEBATTLE.game.current) {
		$("#" + MOEBATTLE.config.canvas + ' .endbutton').removeClass("disable").on("click", MOEBATTLE.nextPlayer);
	} else {
		$("#" + MOEBATTLE.config.canvas + ' .endbutton').addClass("disable").off("click", MOEBATTLE.nextPlayer);
		setTimeout(MOEBATTLE.nextPlayer, 1000);
	}
};
// deal cards to a player
MOEBATTLE.dealCards = function (num, player) {
	// invalid
	if (num <= 0 || player < 0 || player >= MOEBATTLE.players.length) {
		return;
	}
	player = 0;
	// put discard deck back to deck
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
		// animation for drawing a card
		MOEBATTLE.showDetail(card)
		.css({
			top: '48%',
			left: '95%',
			height: '4%',
			width: '1%'
		}).animate({
			top: '10%',
			left: '50%',
			height: '80%',
			width: '40%'
		}, "slow", function () {
			var that = this;
			// show detail for 2000 ms
			setTimeout(function () {
				// move to player's hand
				var top = "75%", left = "45%";
				if (0 == player) {
					top = "75%", left = "45%";
				} else {
					top = "5%", left = "45%";
				}
				$(that).find(".card-detail").hide();
				$(that).animate({
					top: top,
					left: left,
					height: "150px",
					width: "100px"
				}, "slow", function () {
					// create a card
					var card_jquery = MOEBATTLE.createCard(card);
					// put inside myhand canvas
					if (0 == player) {
						$("#" + MOEBATTLE.config.canvas + " .myhand").append(card_jquery.detach());
						card_jquery.removeClass("deck").addClass("inhand inmyhand");
					} else { // put inside yourhand canvas
						$("#" + MOEBATTLE.config.canvas + " .yourhand").append(card_jquery.detach());
						card_jquery.removeClass("deck").addClass("inhand inyourhand");
					}
					// float to left
					card_jquery.css({
						top: "0px",
						left: "0px"
					});
					$(that).fadeOut("slow", function () {
						$(this).find(".card-detail").css({visibility: "inherit"}).show();
					});
					card_jquery.hide().css({visibility: "inherit"}).fadeIn("slow");
				});
			}, 2000);
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
		MOEBATTLE.useCardDirectly(card);
		break;
	}
}
// add a card to player's area
MOEBATTLE.addToArea = function (card, player) {
	MOEBATTLE.players[player].area.push(card);
	// shrink to image size
	var height = $("#" + MOEBATTLE.config.canvas + " .card" + card + " img").height();
	var width = $("#" + MOEBATTLE.config.canvas + " .card" + card + " img").width();
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
	$("#" + MOEBATTLE.config.canvas + ' .card' + card).animate({
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
MOEBATTLE.useCardDirectly = function (card) {
	MOEBATTLE.game.discard.push(card);
	// expand and disappear
	$("#" + MOEBATTLE.config.canvas + ' .card' + card).animate({
		top: '-=100px',
		left: '-=100px',
		height: '+=200px',
		width: '+=200px',
		opacity: 0,
	}, "slow", function () {
		$(this).remove();
		MOEBATTLE.skillAnimate(card, "");
	});
}
// drop a card into board
MOEBATTLE.dropCard = function (card) {
	var card_jq = $("#" + MOEBATTLE.config.canvas + " .card" + card);
	// if not my turn, put card back
	if (0 != MOEBATTLE.game.current) {
		card_jq.animate({
			top: "70%", left: "45%"
		}, "slow", function () {
			// float to left
			$(this).css({
				top: "0px",
				left: "0px"
			});
		});
		return;
	}
	// put out of myhand canvas
	var top = card_jq.position().top + card_jq.parent().position().top;
	var left = card_jq.position().left + card_jq.parent().position().left;
	$("#" + MOEBATTLE.config.canvas).append(card_jq.detach());
	card_jq.removeClass("inhand inmyhand inyourhand");
	card_jq.css({
		top: top,
		left: left
	});
	// if having target
	if (undefined !== MOEBATTLE.cards[card].target) {
		// card center position
		var card_jq = $("#" + MOEBATTLE.config.canvas + " .card" + card);
		var y = card_jq.position().top + card_jq.height() / 2;
		var x = card_jq.position().left + card_jq.width() / 2;
		// draw an arrow following mouse
		var arrowFollow = function (event) {
			var pagex = event.pageX - card_jq.parent().offset().left;
			var pagey = event.pageY - card_jq.parent().offset().top;
			var dist = Math.sqrt((pagex - x) * (pagex - x) + (pagey - y) * (pagey - y));
			var newx = (pagex + x) / 2 - 25;
			var newy = (pagey + y) / 2 - dist / 2;
			// the length is the dist
			$("#" + MOEBATTLE.config.canvas + " .arrow").height(dist);
			var angle = Math.atan2(pagey - y, pagex - x) * 180 / Math.PI + 90;
			$("#" + MOEBATTLE.config.canvas + " .arrow").css({
				top: newy,
				left: newx
			})
			// rotate
			.css({ WebkitTransform: 'rotate(' + angle + 'deg)' }).css({ '-moz-transform': 'rotate(' + angle + 'deg)' })
			.css({visibility: "inherit"}).show();
		};
		// set arrow to follow mouse
		$("html").on("mousemove", arrowFollow)
		// click anywhere to stop the arrow
		.click(function () {
			// remove arrow
			$("html").off('mousemove', arrowFollow);
			$("#" + MOEBATTLE.config.canvas + " .arrow").hide();
			MOEBATTLE.useCardDirectly(card);
		});
	} else { // use directly
		MOEBATTLE.useCard(0, card);
	}
}
// create a card
MOEBATTLE.createCard = function (card) {
	$("#" + MOEBATTLE.config.canvas).append('<div class="card' + card + ' card"><div><span></span><img src="" alt="card" class="" /><div class="card-detail"></div></div><div class="cost param"></div><div class="def param"></div><div class="atk param"></div><div class="card-hp param"></div></div>');
	var card_jq = $("#" + MOEBATTLE.config.canvas + " .card" + card);
	card_jq.draggable();
	// assign content
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div span").html(MOEBATTLE.cards[card].name);
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div img").attr("src", MOEBATTLE.cards[card].photo)
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div .card-detail").html(MOEBATTLE.cards[card].detail)
	.error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div.cost").html(MOEBATTLE.cards[card].cost || 0);
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div.def").html(MOEBATTLE.cards[card].def || 0);
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div.atk").html(MOEBATTLE.cards[card].atk || 0);
	$("#" + MOEBATTLE.config.canvas + " .card" + card + " div.card-hp").html(MOEBATTLE.cards[card].hp || 0);
	card_jq.hover(function () {
		// move to front
		$(this).css("z-index", 1);
		// expand
		//$(this).animate({ height: "+=20px", width: "+=20px", left: "-=10px", top: "-=10px" }, "fast");
		MOEBATTLE.showDetail(card)
		.css({
			top: card_jq.offset().top,
			left: card_jq.offset().left - 90,
			height: "0%",
			width: card_jq.width()
		}).animate({
			top: '-=400px',
			left: '-=120px',
			height: '+=400px',
			width: '+=240px'
		}, "fast", function () {});
	}, function () {
		// move back
		$(this).css("z-index", 0);
		//$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
		$("#" + MOEBATTLE.config.canvas + " .detail")
		.animate({
			top: '+=400px',
			height: '-=400px',
		}, "fast", function () {
			$(this).hide();
		});
	});
	return $("#" + MOEBATTLE.config.canvas + " .card" + card);
};
// animation when creating an icon
MOEBATTLE.createIcon = function (card, height, width) {
	$("#" + MOEBATTLE.config.canvas + ' .myarea').append('<div class="icon' + card + ' icon myuse" style="height: ' + height + 'px; width: ' + width + 'px;"><span></span><img src="" alt="icon" class="" /><div></div><div></div><div></div><div></div></div>');
	$("#" + MOEBATTLE.config.canvas + " .icon" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEBATTLE.config.canvas + " .icon" + card + " div:eq(0)").html(MOEBATTLE.cards[card].atk || 0);
	$("#" + MOEBATTLE.config.canvas + " .icon" + card + " div:eq(1)").html(MOEBATTLE.cards[card].def || 0);
	$("#" + MOEBATTLE.config.canvas + " .icon" + card + " div:eq(2)").html(MOEBATTLE.cards[card].hp || 0);
	$("#" + MOEBATTLE.config.canvas + " .icon" + card + " div:eq(3)").html(MOEBATTLE.cards[card].cost || 0);
	var timer, timer2, degree = 0;
	// rotate when hovering
	var rotate = function (obj) {
		$(obj).css({ WebkitTransform: 'rotate(' + degree + 'deg)' });
		$(obj).css({ '-moz-transform': 'rotate(' + degree + 'deg)' });
		timer = setTimeout(function () {
			++ degree; rotate(obj);
		}, 5);
	}
	$("#" + MOEBATTLE.config.canvas + " .icon" + card).hover(function (obj) {
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
	$("#" + MOEBATTLE.config.canvas + ' .icon' + card).hide().css({visibility: "inherit"}).fadeIn("fast");
	return $("#" + MOEBATTLE.config.canvas + ' .icon' + card);
};
// show detail canvas
MOEBATTLE.showDetail = function (card) {
	$("#" + MOEBATTLE.config.canvas + " .detail .name").html(MOEBATTLE.cards[card].name);
	$("#" + MOEBATTLE.config.canvas + " .detail .cost").html("cost: " + (MOEBATTLE.cards[card].cost || 0));
	$("#" + MOEBATTLE.config.canvas + " .detail .atk").html("moe point: " + (MOEBATTLE.cards[card].atk || 0));
	$("#" + MOEBATTLE.config.canvas + " .detail .card-hp").html("hp: " + (MOEBATTLE.cards[card].hp || 0));
	$("#" + MOEBATTLE.config.canvas + " .detail img").attr("src", MOEBATTLE.cards[card].photo || "");
	$("#" + MOEBATTLE.config.canvas + " .detail .card-detail").html(MOEBATTLE.cards[card].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
	$("#" + MOEBATTLE.config.canvas + " .detail").show().css("visibility", "inherit");
	return $("#" + MOEBATTLE.config.canvas + " .detail");
}
//@deprecated hide detail canvas
MOEBATTLE.hideDetail =function () {
	$("#" + MOEBATTLE.config.canvas + " .detail").slideUp('slow', function () {
		$("#" + MOEBATTLE.config.canvas + " .detail .name").html("");
		$("#" + MOEBATTLE.config.canvas + " .detail .detail").html("");
		$("#" + MOEBATTLE.config.canvas + " .detail img").attr("src", "");
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
	$("#" + MOEBATTLE.config.canvas + ' .anime img').attr("src", ani_list[ran]);
	$("#" + MOEBATTLE.config.canvas + ' .anime').addClass("active").fadeIn("fast").show();
	// disappear after a while
	setTimeout(function () {
		$("#" + MOEBATTLE.config.canvas + ' .anime').fadeOut("slow", function () {
			$(this).removeClass("active");
			$("#" + MOEBATTLE.config.canvas + ' .anime img').attr("src", "");
		});
	}, 3000);
}










