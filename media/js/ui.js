var PlayerView = new Class({
	initialize: function(player, id, playerID) {
		this.player = player;
		this.id = id;
		
		$(this.id).set('value', playerID);
	},
	
	draw: function() {
		var playerView = this;
		
		var images = $(this.id).getElements('img');
		images.setStyle('visibility', 'hidden');
		
		// We only show at max two cards - one for dragging, and one to
		// represent all the other cards in the deck.
		for(var i=0; i < this.player.cards.length && i < 2; i++) {
			var card = this.player.cards[i];
			images[i].set('src', card.back_image());
			images[i].setStyle('visibility', 'visible');
		}
		
		$(this.id).getElement('.counter').set('text', this.player.cards.length);
		
		if (this.player.cardsInPlay.length > 0) {
			var face_image = this.player.cardsInPlay.getLast().face_image();
			$(this.id + '-played').set('src', face_image);
			$(this.id + '-played').setStyle('visibility', 'visible');
		} else {
			$(this.id + '-played').setStyle('visibility', 'hidden');
		}
	}
});

var GameView = new Class({
	initialize: function(game, playerViews) {
		this.game = game;
		this.playerViews = playerViews;
		
		make_cards_draggable();
	},
	
	draw: function() {
		this.playerViews.each(function(playerView) {
			playerView.draw();
		});
		
		if (this.game.game_has_ended()) {
			var winMessage = 'Congratulations to our winner: ';
			var playerID = this.game.winner();
			winMessage += this.game.players[playerID].name;
			$('message').set('text', winMessage);
		}
	},
	
	award_cards: function(winner) {
		var cards = $('playing-field').getElements('img');
		animate_cards_to_deck(cards, this.playerViews[winner].id);
		setTimeout(function() {
			move_cards_to_center(cards);
		}, 500);
	}
});

function make_cards_draggable() {
	$$('#game .draggable').makeDraggable({
		droppables: $$('#playing-field'),
		
		onEnter: function(draggable, droppable){
			droppable.setStyle('background', '#E79D35');
		},
	
		onLeave: function(draggable, droppable){
			droppable.setStyle('background', '#D6DEFF');
		},
	
		onDrop: function(draggable, droppable){
			if (droppable) {
				droppable.setStyle('background', '#D6DEFF');
			}
			
			var playerID = draggable.parentNode.get('value');
			
			if (droppable && game.can_take_turn(playerID)){
				animate_card_to_center(draggable, function() {
					move_card_to_deck(draggable);
					
					game.take_turn(playerID);
					gameView.draw();
					
					setTimeout(function() {
						var winner = game.calculate_turn_result();
						if (winner != null) {
							gameView.award_cards(winner);
							setTimeout(function() {
								gameView.draw();
							}, 500);
						} else {
							gameView.draw();
						}
					}, 200);
				});
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

function animate_card_to_center(card, func) {
	var offset;
	
	switch(card.parentNode.get('id')) {
		case 'player-left':
			offset = {x: 145, y: 0};
			break;
		case 'player-right':
			offset = {x: -145, y: 0};
			break;
		default:
			//console.log(card.parentNode.get('id'));
	}
	card.move_and_call({
		relativeTo: card.parentNode,
		position: 'upperLeft',
		offset: offset,
		duration: 500
	}, func);
};

function move_card_to_deck(card) {
	card.move({
		relativeTo: card.parentNode,
		position: 'upperLeft',
		offset: {x: 0, y: 0},
		duration: 0
	});
}

function animate_cards_to_deck(cards, playerID) {
	cards.each(function(card) {
		cards.move({
			relativeTo: playerID,
			position: 'upperLeft',
			offset: {x: 0, y: 0},
			duration: 500
		});
	});
}

function move_cards_to_center(cards, func) {
	var position;
	var edge;
	
	cards.each(function(card) {
		switch(card.get('id')) {
			case 'player-left-played':
				position = 'upperLeft';
				edge = 'upperLeft';
				break;
			case 'player-right-played':
				position = 'upperRight';
				edge = 'upperRight';
				break;
			default:
				//console.log(card.get('id'));
		}
		card.move({
			relativeTo: 'playing-field',
			position: position,
			edge: edge,
			duration: 0
		});
	});
}

// This function sets up the values for two global variables, game and gameView.
function setup_new_game(){
	// Clear any notification of winners, etc. from previous round.
	$('message').set('text', null);
	
	var cards = generate_deck(['green']).shuffle();
	
	var player1 = new Player('Player 1', cards.slice(0, cards.length/2));
	var player1View = new PlayerView(player1, 'player-left', 0);
	
	var player2 = new Player('Player 2', cards.slice(cards.length/2));
	var player2View = new PlayerView(player2, 'player-right', 1);
	
	game = new Game([player1, player2]);
	gameView = new GameView(game, [player1View, player2View]);
	gameView.draw();
}

function setup_controls() {
	$('auto-play').addEvent('click', function() {
		while(!game.game_has_ended()) {
			if (game.can_take_turn(0)) {
				game.take_turn(0);
			}
			if (game.can_take_turn(1)) {
				game.take_turn(1);
			}
			game.calculate_turn_result();
		}
		gameView.draw();
	});
	$('new-game').addEvent('click', function() {
		// No, we can't just assign this function as the click handler.
		setup_new_game();
	});
}

Element.implement({
	move_and_call: function(options, func) {
		assert(typeof options['duration'] != 'undefined');
		
		this.move(options);
		setTimeout(func, options['duration']);
	}
});
