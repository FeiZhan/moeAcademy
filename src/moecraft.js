// moegirl craft

var MOECRAFT = MOECRAFT || new Object();
MOECRAFT.config = {
	files: ['data/craft.json'],
	canvas: undefined,
};
// initialize by loading json files
MOECRAFT.init = function () {
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
	// load craft files
	for (var i in MOECRAFT.config.files) {
		loadJson(MOECRAFT.config.files[i], function (data) {
			MOECRAFT.craft = MOECRAFT.craft.concat(data.formula);
			for (var j in data.formula)
			{
				for (var k in data.formula[j])
				{
					if ("input" == k)
					{
						MOECRAFT.cards = MOECRAFT.cards.concat(data.formula[j][k]);
					}
				}
			}
		});
	}
};
// init when page loaded
$(function() {
	MOECRAFT.init();
});
// main function
MOECRAFT.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOECRAFT.config.canvas = canvas;
	$("#" + canvas).addClass("moecraft");
	MOECRAFT.showFrame();
	MOECRAFT.waitLoad();
};
// show the framework
MOECRAFT.showFrame = function () {
	var canvas = $("#" + MOECRAFT.config.canvas);
	// clear the canvas
	canvas.empty();
	canvas.droppable({
		drop: function( event, ui ) {
			var card = $(ui.draggable[0]).text();
			var index = MOECRAFT.table.input.indexOf(card);
			if (index > -1) {
				//MOECRAFT.table.input.splice(index, 1);
			}
		}
    });
	// append table
	canvas.append($('<div class="table"></div>'));
	// drop callback for table
	$("#" + MOECRAFT.config.canvas + ' .table').droppable({
		drop: function( event, ui ) {
			var card = $(ui.draggable[0]).text();
			MOECRAFT.table.input.push(card);
		}
    });
	// append deck
	canvas.append($('<div class="deck"></div>'));
	canvas.append($('<button id="button" type="button">craft</button>'));
	$("button").click(function () {
		MOECRAFT.doCraft();
	});
};
// wait for loading files
MOECRAFT.waitLoad = function () {
	if ((typeof MOECRAFT.craft != "array" && typeof MOECRAFT.craft != "object") || MOECRAFT.craft.length == 0) {
		console.log("loading");
		setTimeout(MOECRAFT.waitLoad, 300);
		return;
	}
	for (var i = 0; i < 5; ++ i)
	{
		MOECRAFT.drawRandom();
	}
};
MOECRAFT.craft = new Array();
MOECRAFT.cards = new Array();
MOECRAFT.table = {
	input: new Array(),
	output: new Array()
};
MOECRAFT.deck = new Array();
MOECRAFT.drawRandom = function () {
	var r = Math.random();
	var num = Math.floor(r * MOECRAFT.cards.length);
	MOECRAFT.deck.push(MOECRAFT.cards[num]);
	MOECRAFT.drawCard(MOECRAFT.cards[num]);
}
MOECRAFT.drawCard = function (card) {
	$("#" + MOECRAFT.config.canvas + ' .deck').append('<div class="card">' + card + '</div>');
	$("#" + MOECRAFT.config.canvas + ' .deck .card').draggable();
}
MOECRAFT.doCraft = function () {
	console.debug(MOECRAFT.table.input);
};