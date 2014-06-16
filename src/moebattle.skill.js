// moegirl battle skills

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
MOEPROJ.MOEBATTLE.SKILLS = MOEPROJ.MOEBATTLE.SKILLS || new Object();
var SKILLS = MOEPROJ.MOEBATTLE.SKILLS;

SKILLS.loseHP = function (action) {
	MOEBATTLE.actions.unshift({
		type: "playerLoseHP",
		target: action.from ? 0 : 1,
		number: 1,
	});
}
SKILLS.charLoseHP = function (action) {
	MOEBATTLE.actions.unshift({
		type: "charLoseHP",
		target: action.target,
		number: 1,
		card: action.card,
	});
}
SKILLS.drawCard = function (action) {
	MOEBATTLE.actions.unshift({
		type: "cardsDraw",
		target: action.from,
		number: 2,
	});
}
SKILLS.gainPositiveStatus = function (action) {
	MOEBATTLE.actions.unshift({
		type: "playerGainStatus",
		target: action.from,
		status: 0,
	});
}
