var PlayerView = new Class({
	initialize: function(player, id) {
		this.player = player;
		this.id = id;
	},
	
	draw: function() {
		var back = (this.player.cards.length > 0) ? this.player.cards[0].back_image() : '';
		$(this.id).getElement('img').set('src', back);
		
		$(this.id).getElement('.counter').set('text', this.player.cards.length);
	}
});
