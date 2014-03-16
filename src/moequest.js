// moegirl quest

var MOEQUEST = MOEQUEST || new Object();
MOEQUEST.config = {
	files: ['data/moegirls.json'],
	canvas: undefined,
	ans_canvas: undefined,
	// 4 options for a question
	option_num: 4,
	quest: new Object(),
	results: new Array(),
};
// initialize by loading json files
MOEQUEST.init = function () {
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
	for (var i in MOEQUEST.config.files) {
		loadJson(MOEQUEST.config.files[i], function (data) {
			// add to moegirl list
			MOEQUEST.moegirls = MOEQUEST.moegirls.concat(data);
		});
	}
};
// init when page loaded
$(function() {
	MOEQUEST.init();
});
// main function
MOEQUEST.run = function (canvas, ans) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEQUEST.config.canvas = canvas;
	MOEQUEST.config.ans_canvas = ans;
	MOEQUEST.showFrame();
	MOEQUEST.waitLoad();
};
// wait for loading files
MOEQUEST.waitLoad = function () {
	if ((typeof MOEQUEST.moegirls != "array" && typeof MOEQUEST.moegirls != "object") || MOEQUEST.moegirls.length == 0) {
		console.log("loading");
		setTimeout(MOEQUEST.waitLoad, 300);
		return;
	}
	MOEQUEST.showQuest();
};
// show the framework
MOEQUEST.showFrame = function () {
	var canvas = $("#" + MOEQUEST.config.canvas);
	// clear the canvas
	canvas.empty();
	// append the question
	canvas.append($('<div class="id-question question"><span></span><img src="" alt="question" class="" /></div>'));
	$("#" + MOEQUEST.config.canvas + " .id-question img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// append the last result
	canvas.append($('<img border="0" src="resources/correct.ico" alt="result" width="10%" class="id-lastresult lastresult" />'));
	// append submit button
	canvas.append($('<button type="button" class="id-submitbutton button submitbutton">Answer</button>'));
	$("#" + MOEQUEST.config.canvas + " .id-submitbutton").click(MOEQUEST.submitQuest);
	// append clear button
	/*canvas.append($('<button type="button" class="id-clearbutton button clearbutton">Clear</button>'));
	$("#" + MOEQUEST.config.canvas + " .id-clearbutton").click(MOEQUEST.clearChecked);*/

	// append options
	canvas.append($('<div class="id-optionsection optionsection" />'));
	html = $("#" + MOEQUEST.config.canvas + " .id-optionsection");
	// for each option
	for (var i = 0; i < MOEQUEST.config.option_num; ++ i) {
		html.append($('<div class="id-option' + i + ' option" />'));
		var html2 = $("#" + MOEQUEST.config.canvas + " .id-option" + i);
		// append a checkbox
		html2.append('<input type="checkbox" name="check' + i + '" value="' + i + '" class="id-check' + i + ' check" />').append('<span></span><img src="" alt="question" class="" />');
		$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// append click event for span, clicking the words has the same effect with checkbox
		$("#" + MOEQUEST.config.canvas + " .id-option" + i + " span").click(function () {
			var check = $(this).prev();
			check.trigger('click'); 
		});
	}

	// for answer canvas
	canvas = $("#" + MOEQUEST.config.ans_canvas);
	canvas.empty();
	canvas.append($('<div class="id-question question"><span></span></div>'));
	canvas.append($('<div class="id-optionsection optionsection" />'));
	html = $("#" + MOEQUEST.config.ans_canvas + " .id-optionsection");
	for (var i = 0; i < 4; ++ i) {
		html.append($('<div class="id-option' + i + ' option" />'));
		var html2 = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + i);
		html2.append('<span></span>');
	}
};
// show the quest
MOEQUEST.showQuest = function () {
	// create a quest
	quest = MOEQUEST.createQuest();
	// show question
	$("#" + MOEQUEST.config.canvas + " .id-question span").html(quest.question);
	// show question image
	if (undefined !== quest.question_img) {
		$("#" + MOEQUEST.config.canvas + " .id-question img").attr("src", quest.question_img);
		$("#" + MOEQUEST.config.canvas + " .id-question img").addClass("show");
	} else { // hide image
		$("#" + MOEQUEST.config.canvas + " .id-question img").attr("src", "");
		$("#" + MOEQUEST.config.canvas + " .id-question img").removeClass("show");
	}
	// for each option
	for (var i = 0; i < quest.options.length; ++ i) {
		var option = $("#" + MOEQUEST.config.canvas + " .id-option" + i + " span");
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		// show option
		option.html(quest.options[i]);
		// show option image
		if (undefined !== quest.option_img && undefined !== quest.option_img[i]) {
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").attr("src",quest.option_img[i]);
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").addClass("show");
		} else { // hide image
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").attr("src","");
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").removeClass("show");
		}
	}
	// fade in
	$("#" + MOEQUEST.config.canvas + " .id-question").hide().css({visibility: "inherit"}).fadeIn("slow");
	$("#" + MOEQUEST.config.canvas + " .option").hide().css({visibility: "inherit"}).fadeIn("slow");
};
// show the answer
MOEQUEST.showAnswer = function (quest) {
	if (undefined === MOEQUEST.config.ans_canvas || $("#" + MOEQUEST.config.ans_canvas).length == 0) {
		return;
	}
	$("#" + MOEQUEST.config.ans_canvas + " .id-question span").text(quest.question);
	for (var i = 0; i < quest.options.length; ++ i) {
		var option = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + i + " span");
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		option.text(quest.options[i]);
		$("#" + MOEQUEST.config.ans_canvas + " .id-option" + i).removeClass( "correct" );
	}
	for (var i in quest.correct) {
		 var correct = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + quest.correct[i]);
		if (correct.length == 0) {
			console.warn("correct answer does not exist", i);
			continue;
		}
		correct.addClass( "correct" );
	}
	var clone = $("#" + MOEQUEST.config.canvas).clone().appendTo($("#" + MOEQUEST.config.canvas).parent());
	clone.html("")/*.css('z-index', -10)*/;
	var ans = $("#" + MOEQUEST.config.ans_canvas);
	clone.animate({
		width: ans.width(),
		height: ans.height(),
		top: ans.position().top,
		left: ans.position().left,
	}, "slow", function () {
		$(this).remove();
		$("#" + MOEQUEST.config.ans_canvas).hide().css({visibility: "inherit"}).fadeIn("slow");
	});
};
// submit a quest
MOEQUEST.submitQuest = function () {
	MOEQUEST.checkAnswer();
	// if the max number has reached
	if (false) {
		console.log("game over");
		return;
	}
	MOEQUEST.clearChecked();
	// show the next one
	MOEQUEST.showQuest();
};
// check if the answer is correct
MOEQUEST.checkAnswer = function () {
	var quest = MOEQUEST.config.quest;
	var ans = new Array();
	// get user's answer
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .check").each(function (index, value) {
		var check = $(value)[0];
		var val = parseInt($(value).attr('value'));
		if (! (val in quest.options)) {
			console.warn("invalid answer", val);
			return;
		}
		if (check.checked) {
			ans.push(val);
		}
	});
	var wrong_flag = false;
	// answer number is wrong
	if (ans.length != quest.correct.length) {
		wrong_flag = true;
	} else {
		ans.sort();
		quest.correct.sort();
		for (var i in ans) {
			if (! (i in quest.correct) || ans[i] != quest.correct[i]) {
				wrong_flag = true;
				break;
			}
		}
	}
	// append to result list
	MOEQUEST.config.results.push(! wrong_flag);
	// show last result image
	$("#" + MOEQUEST.config.canvas + " .id-lastresult").attr("src",'resources/' + (wrong_flag ? "incorrect" : "correct") + '.ico').hide().css({visibility: "inherit"}).fadeIn("slow");
	MOEQUEST.showAnswer(quest);
};
// clear checked checkboxes
MOEQUEST.clearChecked = function () {
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .check").each(function (index, value) {
		$(value).attr('checked', false); 
	});
};
// create a quest
MOEQUEST.createQuest = function () {
	MOEQUEST.config.quest = MOEQUEST.createMoegirlQuest();
	window["peek"] = MOEQUEST.config.quest.correct;
	return MOEQUEST.config.quest;
}
// moegirl list
MOEQUEST.moegirls = new Array();
// create a quest based on moegirl list
MOEQUEST.createMoegirlQuest = function () {
	var quest = {
		question: "",
		question_img: undefined,
		options: [],
		option_img: [],
		correct: []
	};
	// choose some moegirls as options
	var choices = new Array();
	// if too few moegirls
	if (MOEQUEST.moegirls.length < MOEQUEST.config.option_num) {
		// add all
		for (var i in MOEQUEST.moegirls) {
			choices.push(i);
		}
	} else {
		// choose by random
		while (choices.length < MOEQUEST.config.option_num) {
			var ran = Math.floor( (Math.random() * MOEQUEST.moegirls.length) );
			// check if duplicate
			if (choices.indexOf(ran) <= -1) {
				choices.push(ran);
			}
		}
	}
	// attributes for question
	var QUEST_ATTR = ["photo", '发色', '瞳色', '声优', '身高'];
	// choose an attribute by random
	var ran = Math.floor( (Math.random() * QUEST_ATTR.length) );
	// a list of moegirls with valid attribute
	var good_choices = new Array();
	for (var i in choices) {
		if (undefined !== MOEQUEST.moegirls[choices[i]][QUEST_ATTR[ran]]) {
			good_choices.push(choices[i]);
			break;
		}
	}
	// no one has selected attribute
	if (0 == good_choices.length) {
		console.warn("question attr fails to find a good choice", QUEST_ATTR[ran]);
		return;
	}
	// choose one as answer by random
	var answer = Math.floor( (Math.random() * good_choices.length) );
	if (choices.indexOf(good_choices[answer]) <= -1) {
		console.warn("invalid answer", MOEQUEST.moegirls[good_choices[answer]].name);
		return;
	}
	// shuffle choices
	for (var j, x, i = choices.length; i; j = Math.floor(Math.random() * i), x = choices[--i], choices[i] = choices[j], choices[j] = x)
	{}
	// find correct ones
    for (var i in choices) {
		if (MOEQUEST.moegirls[good_choices[answer]][QUEST_ATTR[ran]] == MOEQUEST.moegirls[choices[i]][QUEST_ATTR[ran]]) {
			quest.correct.push(i);
		}
	}
	// assign names to options
	for (var i in choices) {
		quest.options.push(MOEQUEST.moegirls[choices[i]].name);
		if ("photo" != QUEST_ATTR[ran]) {
			quest.option_img.push(MOEQUEST.moegirls[choices[i]].photo);
		}
	}
	// assign question sentence
	switch (QUEST_ATTR[ran]) {
	case "photo":
		quest.question = "该图片是哪位萌娘？";
		quest.question_img = MOEQUEST.moegirls[good_choices[answer]].photo;
		break;
	case '发色':
		quest.question = "哪位萌娘的发色是<strong>" + MOEQUEST.moegirls[good_choices[answer]]['发色'] + "</strong>？";
		break;
	case '瞳色':
		quest.question = "哪位萌娘的瞳色是<strong>" + MOEQUEST.moegirls[good_choices[answer]]['瞳色'] + "</strong>？";
		break;
	case '声优':
		quest.question = "哪位萌娘的声优是<strong>" + MOEQUEST.moegirls[good_choices[answer]]['声优'] + "</strong>？";
		break;
	case '身高':
		quest.question = "哪位萌娘的身高是<strong>" + MOEQUEST.moegirls[good_choices[answer]]['身高'] + "</strong>？";
		break;
	default:
		quest.question = "答案是哪位萌娘？";
		return;
		break;
	}
	return quest;
};

















