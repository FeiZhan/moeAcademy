var MOEPROJECT = MOEPROJECT || new Object();
MOEPROJECT.config = {
	files: ['data/.json'],
	canvas: undefined,
};
MOEPROJECT.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEPROJECT.config.canvas = canvas;
	MOEPROJECT.showFrame();
};
MOEPROJECT.showFrame = function () {
	var html = 
	'<div id="wrapper">'
		+ '<div id="columns">'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />'
				+ '<p>'
					+ 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/1/1swi3Qy.png" />'
				+ '<p>'
					+ 'Donec a fermentum nisi. '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/6/6f3nXse.png" />'
				+ '<p>'
					+ 'Nullam eget lectus augue. Donec eu sem sit amet ligula '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/8/8kEc1hS.png" />'
				+ '<p>'
					+ 'Nullam eget lectus augue. Donec eu sem sit amet ligula '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/6/6f3nXse.png" />'
				+ '<p>'
					+ 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
				+ '</p>'
			+ '</div>	'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/2/2v3VhAp.png" />'
				+ '<p>'
					+ 'Donec a fermentum nisi. Integer dolor est, commodo ut '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/1/1swi3Qy.png" />'
				+ '<p>'
					+ 'Donec a fermentum nisi. Integer dolor est, commodo ut '
				+ '</p>'
			+ '</div>'
			+ '<div class="pin">'
				+ '<img src="http://cssdeck.com/uploads/media/items/6/6f3nXse.png" />'
				+ '<p>'
					+ 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				+ '</p>'
			+ '</div>'
		+ '</div>'
	+ '</div>';
	$("#" + MOEPROJECT.config.canvas).append(html);
	$(window).scroll(function() {
		clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			if ($(window).scrollTop() == ($(document).height() - $(window).height())) {
				console.log("load more!");
			}
		}, 250));
	});
}