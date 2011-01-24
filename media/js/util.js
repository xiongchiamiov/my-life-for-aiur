// Don't call this function a second time without destroying all images first.
// It relies upon an incredibly naive method of assigning unique IDs.
function generate_deck(backs) {
	cards = [];
	id = 1;
	
	backs.each(function(back) {
		['clubs', 'diamonds', 'hearts', 'spades'].each(function(suit) {
			for (var value=2; value < 15; value++) { // aces are high
				cards.push(new Card(value, suit, back, id++));
			}
		});
	});
	
	return cards;
};

// Thanks to David Walsh
// http://davidwalsh.name/array-shuffling-mootools
Array.implement({
	shuffle: function() {
		//destination array
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	}
});

// Thanks to Ayman Hourieh
// http://aymanh.com/9-javascript-tips-you-may-not-know#assertion
// Licensed under http://creativecommons.org/licenses/by-nc-sa/3.0/
function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
	return 'AssertException: ' + this.message;
}

function assert(exp, message) {
	if (!exp) {
		throw new AssertException(message);
	}
}
