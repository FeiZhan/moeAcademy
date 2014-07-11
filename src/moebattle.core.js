// moegirl battle

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
var MOEBATTLE = MOEPROJ.MOEBATTLE;

MOEBATTLE.ui;
MOEBATTLE.data = ['data/battle.json', 'data/filenames.json'];
MOEBATTLE.load = function (canvas) {
	// set ui
	MOEBATTLE.ui = MOEPROJ.MOEBATTLEUI;
	MOEBATTLE.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOEBATTLE.ui.html,
		data: MOEBATTLE.data,
	}, MOEBATTLE.run, MOEBATTLE.loadData);
};
// callback for loading json data
MOEBATTLE.loadData = function (data, file) {
	switch (file) {
	case 'data/filenames.json':
		break;
	case 'data/battle.json':
		MOEBATTLE.battle = data;
		MOEBATTLE.cards = MOEBATTLE.cards.concat(data.cards);
		break;
	default:
		MOEBATTLE.moegirls = MOEBATTLE.moegirls.concat(data);
		break;
	}
};
// system data
MOEBATTLE.moegirls = new Array();
MOEBATTLE.battle = new Array();
MOEBATTLE.cards = new Array();

// run when loading completes
MOEBATTLE.run = function () {
	MOEBATTLE.ui.load();
	// execute based on action list
	MOEBATTLE.actions.push({ type: "gameStart" });
	// check next action periodically
	setInterval(function () {
		MOEBATTLE.nextAction();
	}, 100);
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
// player list
MOEBATTLE.players = new Object();
// player
MOEBATTLE.Player = function (config) {
	this.name = config.name || "unknown";
	this.order = config.order;
	this.maxhp = config.maxhp || 20;
	this.hp = config.hp || 20;
	this.maxmp = config.maxmp || 0;
	this.mp = config.mp || 0;
	this.hands = new Array();
	this.chars = new Object();
	this.statuses = new Array();
	this.equips = new Array();
};
// action list
MOEBATTLE.actions = new Array();
// execute the next action
MOEBATTLE.nextAction = function () {
	// no more actions or locked
	if (0 == MOEBATTLE.actions.length || MOEBATTLE.ui.AnimaCount > 0) {
		return;
	}
	var action = MOEBATTLE.actions.shift();
	// invalid action
	if (undefined === action.type) {
		return;
	}
	console.log(action.type)
	if ("function" == typeof MOEBATTLE[action.type]) {
		MOEBATTLE[action.type] (action);
	}
}
