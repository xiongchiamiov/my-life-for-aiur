var PlayerView = new Class({
	initialize: function(player, id) {
		this.player = player;
		this.id = id;
	},
	
	draw: function() {
		var playerView = this;
		
		this.player.cards.each(function(card) {
			$(playerView.id).grab(new Element('img', {src: card.back_image(), class: 'draggable'}), 'top');
		});
		make_cards_draggable();
		
		$(this.id).getElement('.counter').set('text', this.player.cards.length);
	}
});

function make_cards_draggable() {
	$$('#game .draggable').makeDraggable({
		droppables: $$('#playing-field'),
		
		onEnter: function(draggable, droppable){
			droppable.setStyle('background', '#E79D35');
		},
	
		onLeave: function(draggable, droppable){
			droppable.setStyle('background', '#6B7B95');
		},
	
		onDrop: function(draggable, droppable){
			if (droppable){
				var offset;
				switch(draggable.parentNode.get('id')) {
					case 'player-left':
						offset = {x: 145, y: 0};
						break;
					case 'player-right':
						offset = {x: -145, y: 0};
						break;
					default:
						console.log(draggable.parentNode.get('id'));
				}
				
				var mover = new Fx.Move(draggable, {
					relativeTo: draggable.parentNode,
					position: 'upperLeft',
					offset: offset
				});
				mover.start();
			} else {
				// If we don't land on the playing field,
				// return the card to the deck.
				var mover = new Fx.Move(draggable, {
					relativeTo: draggable.parentNode,
					position: 'upperLeft'
				});
				mover.start();
			}
		}
	});
};
