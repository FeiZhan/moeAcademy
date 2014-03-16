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
			if (undefined !== MOEBATTLE.cards[card].target) {
				var y = $("#" + MOEBATTLE.config.canvas + " .id-card" + card).position().top + 80;
				var x = $("#" + MOEBATTLE.config.canvas + " .id-card" + card).position().left + 60;
				var arrowFollow = function (event) {
					var dist = Math.sqrt((event.pageX - x) * (event.pageX - x) + (event.pageY - y) * (event.pageY - y));
					var newx = (event.pageX + x) / 2 - 25;
					var newy = (event.pageY + y) / 2 - dist / 2;
					$("#" + MOEBATTLE.config.canvas + " .id-arrow").height(dist);
					var angle = Math.atan2(event.pageY - y, event.pageX - x) * 180 / Math.PI + 90;
					$("#" + MOEBATTLE.config.canvas + " .id-arrow").css({
						top: newy,
						left: newx
					}).css({visibility: "inherit"}).show().css({ WebkitTransform: 'rotate(' + angle + 'deg)' }).css({ '-moz-transform': 'rotate(' + angle + 'deg)' });
				};
				$("html").click(function () {
						$("html").off('mousemove', arrowFollow);
						$("#" + MOEBATTLE.config.canvas + " .id-arrow").hide();
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
					}).mousemove(arrowFollow);
			} else {
				MOEBATTLE.useCard(0, card);
			}
		}
    });
	// append my area and your area
	canvas.append($('<div class="id-myarea area"><a href="#" class="id-endbutton button">结束</a></div>')).append($('<div class="id-yourarea area"></div>'));
	$("#" + MOEBATTLE.config.canvas + ' .id-myarea').droppable({
		drop: function( event, ui ) {
		}
    });
	// append my usearea and your usearea
	canvas.append($('<div class="id-myusearea usearea"></div>')).append($('<div class="id-yourusearea usearea"></div>'));
	$("#" + MOEBATTLE.config.canvas + ' .id-endbutton').click(MOEBATTLE.nextPlayer);
	canvas.append($('<div class="id-anime"><img src="#" alt="anime" class="" /></div>'));
	$("#" + MOEBATTLE.config.canvas + " .id-anime img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	canvas.append($('<div class="id-detail"><div class="name"></div><img src="#" alt="photo" class="" /><br /><div class="detail"></div></div>'));
	$("#" + MOEBATTLE.config.canvas + " .id-detail img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	canvas.append($('<div class="id-arrow"><canvas class="id-arrowcanvas" /></div>'));
	var arrow = document.getElementsByClassName('id-arrowcanvas')[0].getContext('2d');
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
	$("#battle .turn").removeClass("turn").css("border-color", "#98bf21");
	++ MOEBATTLE.game.current;
	if (MOEBATTLE.game.current >= MOEBATTLE.players.length) {
		MOEBATTLE.game.current %= MOEBATTLE.players.length;
		++ MOEBATTLE.game.round_count;
	}
	if (0 == MOEBATTLE.game.current) {
		$("#battle .id-myarea").addClass("turn").css("border-color", "red");
	} else {
		$("#battle .id-yourarea").addClass("turn").css("border-color", "red");
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
			var timer;
			$(this).hover(function () {
				$(this).css("z-index", 1);
				$(this).animate({ height: "+=20px", width: "+=20px", left: "-=10px", top: "-=10px" }, "fast");
				var card;
				$($(this).attr('class').split(' ')).each(function (i, val) {
					if (val.substring(0, 7) == "id-card") {
						card = val.substring(7);
					}
				});
				if (! timer) {
					timer = setTimeout(function () {
						timer = null;
						if (undefined !== MOEBATTLE.cards[card]) {
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
					}, 1000);
				}
			}, function () {
				$(this).css("z-index", 0);
				$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				else {
					$("#" + MOEBATTLE.config.canvas + " .id-detail").slideUp('slow', function () {
						$("#" + MOEBATTLE.config.canvas + " .id-detail .name").html("");
						$("#" + MOEBATTLE.config.canvas + " .id-detail .detail").html("");
						$("#" + MOEBATTLE.config.canvas + " .id-detail img").attr("src", "");
					});
				}
			});
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
		MOEBATTLE.skillAnimate(card, "skill0");
	});
};
MOEBATTLE.skillAnimate = function (card, skill) {
	if (! (card in MOEBATTLE.cards) || undefined === MOEBATTLE.cards[card].anime || undefined === MOEBATTLE.cards[card].anime[skill]) {
		return;
	}
	var ani_list = MOEBATTLE.cards[card].anime[skill];
	var ran = Math.floor( (Math.random() * ani_list.length) );
	$("#" + MOEBATTLE.config.canvas + ' .id-anime img').attr("src", ani_list[ran]);
	$("#" + MOEBATTLE.config.canvas + ' .id-anime').addClass("active").fadeIn("fast").show();
	setTimeout(function () {
		$("#" + MOEBATTLE.config.canvas + ' .id-anime').fadeOut("slow", function () {
			$(this).removeClass("active");
			$("#" + MOEBATTLE.config.canvas + ' .id-anime img').attr("src", "");
		});
	}, 3000);
}










