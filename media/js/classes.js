var Card = new Class({
	initialize: function(value, suit, back) {
		this.value = value;
		this.suit = suit;
		this.back = back;
	},
	
	face_image: function() {
		return 'images/'+this.suit+'-'+this.value+'.png';
	},
	
	back_image: function() {
		return 'images/'+this.back+'.png';
	}
});
var Player = new Class({
	initialize: function(name, cards) {
		this.name = name;
		this.cards = cards;
		this.cardsInPlay = [];
		this.hasPlayed = 0;
	},
	
	play_card: function() {
		this.cardsInPlay.push(this.cards.shift());
		this.hasPlayed += 1;
	}
});
var Game = new Class({
	initialize: function(players) {
		this.players = players;
		this.war = false;
	},
	
	can_take_turn: function(playerID) {
		assert(playerID < this.players.length);
		
		return ((this.war && this.players[playerID].hasPlayed < 4)
		    || (!this.war && !this.players[playerID].hasPlayed));
	},
	
	take_turn: function(playerID) {
		this.players[playerID].play_card();
		
		// In a war, we want the player to be marked as ready
		// if they play their last card.
		if (this.war && this.players[playerID].cards.length == 0) {
			this.players[playerID].hasPlayed = 4;
		}
	},
		
	// Returns an integer index of the player who won the round,
	// or null if the round we're still waiting on someone to play.
	calculate_turn_result: function() {
		if (this.everyone_is_ready()) {
			var result = this.calculate_result();
			assert(result.length > 0);
			
			var winner = null;
			
			if (result.length > 1) {
				this.war = result;
			} else { // somebody won this round
				this.war = false;
				winner = result[0];
				this.players[result[0]].cards.append(this.cards_in_play().shuffle());
				this.clean_up_cards();
				this.prune_losers();
			}
			
			this.reset_played_status();
		}
		
		return winner;
	},
	
	calculate_result: function() {
		var max = -1;
		var best = [];
		
		this.cards_in_active_play().each(function(card, index) {
			if (card.value > max) {
				max = card.value;
				best = [index];
			} else if (card.value == max) {
				best.push(index);
			}
		});
		
		return best;
	},
	
	everyone_is_ready: function() {
		var game = this;
		return (this.war)
			   ? this.war.every(function(playerID) {
					return game.players[playerID].hasPlayed > 3;
				 })
			   : this.players.every(function(player) {
					return player.hasPlayed;
				 });
	},
	
	cards_in_play: function() {
		return this.players.map(function(player) {
			return player.cardsInPlay;
		}).flatten();
	},
	
	cards_in_active_play: function() {
		return this.players.map(function(player) {
			return player.cardsInPlay.getLast();
		});
	},
	
	clean_up_cards: function() {
		this.players.each(function(player){
			player.cardsInPlay = [];
		});
	},
	
	prune_losers: function() {
		this.players.each(function(player) {
			if (player.cards.length == 0) {
				// Pretend that they're always ready
				player.hasPlayed = 4;
			}
		});
	},
	
	game_has_ended: function() {
		// If we're in the middle of a war, players can have no cards,
		// yet still have a chance to win.
		if (this.war) {
			return false;
		}
		
		var someone_has_cards = false;
		for (i = 0; i < this.players.length; i++) {
			if (this.players[i].cards.length > 0) {
				if (someone_has_cards) {
					return false;
				} else {
					someone_has_cards = true;
				}
			}
		}
		
		return true;
	},
	
	reset_played_status: function() {
		this.players.each(function(player){
			player.hasPlayed = 0;
		});
	}
});
