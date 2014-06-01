// moegirl craft

MOEPROJ.MOECRAFT = MOEPROJ.MOECRAFT || new Object();
var MOECRAFT = MOEPROJ.MOECRAFT;

MOECRAFT.ui;
MOECRAFT.data = ['data/craft.json'];
MOECRAFT.load = function (canvas) {
	// set ui
	MOECRAFT.ui = MOEPROJ.MOECRAFTUI;
	MOECRAFT.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOECRAFT.ui.html,
		data: MOECRAFT.data,
	}, MOECRAFT.run, MOECRAFT.loadData);
};
// callback for loading json data
MOECRAFT.loadData = function (data) {
	MOECRAFT.craft = MOECRAFT.craft.concat(data.formula);
	// extract card list from inputs and outputs of formulas
	for (var j in data.formula)
	{
		for (var k in data.formula[j])
		{
			if ("input" == k)
			{
				MOECRAFT.cards = MOECRAFT.cards.concat(data.formula[j][k]);
			}
			else if ("output" == k)
			{
				MOECRAFT.cards = MOECRAFT.cards.concat(data.formula[j][k]);
			}
		}
	}
};
// run when loading completes
MOECRAFT.run = function () {
	// sort formulas
	for (var i in MOECRAFT.craft) {
		if ("input" in MOECRAFT.craft[i]) {
			MOECRAFT.craft[i].input.sort();
		}
		if ("output" in MOECRAFT.craft[i]) {
			MOECRAFT.craft[i].output.sort();
		}
	}
	// prepare ui
	MOECRAFT.ui.load();
	// game starts
	for (var i = 0; i < 5; ++ i)
	{
		MOECRAFT.drawRandom();
	}
};
// craft formulas
MOECRAFT.craft = new Array();
// all cards
MOECRAFT.cards = new Array();
// cards on the table
MOECRAFT.table = new Array();
// the last of card id
MOECRAFT.lastId = 0;
// cards on the hand
MOECRAFT.myCards = new Object();
// draw a random card
MOECRAFT.drawRandom = function () {
	var r = Math.random();
	var num = Math.floor(r * MOECRAFT.cards.length);
	var card = {
		id: ++ MOECRAFT.lastId,
		num: num,
		name: MOECRAFT.cards[num],
		status: "hand",
	};
	MOECRAFT.myCards[card.id] = card;
	MOECRAFT.ui.drawCard(card);
	return card;
}
MOECRAFT.putCardOnTable = function (card_id) {
	card_id = parseInt(card_id.substr(5));
	MOECRAFT.myCards[card_id].status = "table";
	MOECRAFT.table.push(card_id);
}
MOECRAFT.takeCardBack = function (card_id) {
	card_id = parseInt(card_id.substr(5));
	var index = MOECRAFT.table.indexOf(card_id);
	MOECRAFT.table.splice(index, 1);
	MOECRAFT.myCards[card_id].status = "hand";
}
// do the crafting
MOECRAFT.doCraft = function () {
	// sort the input cards
	var inputs = new Array();
	for (var i in MOECRAFT.table) {
		inputs.push(MOECRAFT.myCards[ MOECRAFT.table[i] ].name);
	}
	inputs.sort();
	// find a suitable formula
	for (var i in MOECRAFT.craft)
	{
		if (MOECRAFT.craft[i].input.length != inputs.length) {
			continue;
		}
		var flag = true;
		for (var j in MOECRAFT.craft[i].input) {
			if (MOECRAFT.craft[i].input[j] != inputs[j]) {
				flag = false;
				break;
			}
		}
		// find
		if (flag) {
			var input = $.extend(true, [], MOECRAFT.table);
			MOECRAFT.table = new Array();
			// the cards on the table become the output cards
			for (var j in MOECRAFT.craft[i].output) {
				var card = {
					id: ++ MOECRAFT.lastId,
					num: -1,
					name: MOECRAFT.craft[i].output[j],
					status: "table",
				};
				MOECRAFT.myCards[card.id] = card;
				MOECRAFT.table.push(card.id);
			}
			MOECRAFT.ui.doCraft(input, MOECRAFT.table);
			break;
		}
	}
};

// moegirl craft ui

MOEPROJ.MOECRAFTUI = MOEPROJ.MOECRAFTUI || new Object();
var MOECRAFTUI = MOEPROJ.MOECRAFTUI;

MOECRAFTUI.html = ' \
	<div id="table"></div> \
	<div id="hand"></div> \
	<button id="craftbutton" type="button">craft</button> \
	<button id="drawbutton" type="button">draw cards</button> \
';
MOECRAFTUI.init = function (canvas) {
	document.title = "萌娘合成";
	$("#" + canvas).addClass("moecraft");
};
MOECRAFTUI.load = function () {
	// drop callback for table
	$("#" + MOEPROJ.config.canvas + ' #table').droppable({
		drop: function( event, ui ) {
			MOECRAFT.putCardOnTable(ui.draggable[0].id);
			// move card to table
			var element = $(ui.draggable[0]).detach();
			$("#" + MOEPROJ.config.canvas + ' #table').append(element);
		},
		out: function(event, ui) {
			MOECRAFT.takeCardBack(ui.draggable[0].id);
		},
    });
    // craft button callback
	$("#craftbutton").click(function () {
		MOECRAFT.doCraft();
	});
    // draw button callback
	$("#drawbutton").click(function () {
		MOECRAFT.drawRandom();
	});
};
MOECRAFTUI.drawCard = function (card) {
	$("#" + MOEPROJ.config.canvas + ' #hand').append('<div id="card-' + card.id + '" class="card">' + card.name + '</div>');
	var card_jq = $("#" + MOEPROJ.config.canvas + ' #card-' + card.id);
	card_jq.draggable({
		stop: function (evt, ui) {
			card_id = evt.target.id.substr(5);
			if ("hand" == MOECRAFT.myCards[card_id].status) {
				// move card to hand
				var element = $(evt.target).detach();
				$("#" + MOEPROJ.config.canvas + ' #hand').append(element);
			}
			// move back, no matter where it belongs
			$(evt.target).css({
				top: '0px',
				left: '0px',
			});
		}
	});
	return card_jq;
};
MOECRAFTUI.doCraft = function (input, output) {
	// remove inputs
	$('.moecraft #table .card').remove();
	// generate output cards
	for (var j in output) {
		var jq = MOECRAFTUI.drawCard( MOECRAFT.myCards[output[j]] );
		// move card to table
		var element = jq.detach();
		$("#" + MOEPROJ.config.canvas + ' #table').append(element);
	}
};
