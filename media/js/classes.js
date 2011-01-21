var Card = new Class({
	initialize: function(value, suit, back) {
		this.value = value;
		this.suit = suit;
		this.back = back;
	},
	
	face_image: function() {
		return 'images/'+suit+'-'+value+'.png';
	},
	
	back_image: function() {
		return 'images/'+back+'.png';
	},
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
	},
});
var Game = new Class({
	initialize: function(players) {
		this.players = players;
		this.war = false;
	},
	
	take_turn: function(playerID) {
		assert(playerID < this.players.length);
		
		if ((this.war && this.players[playerID].hasPlayed > 3)
		|| (!this.war && this.players[playerID].hasPlayed)) {
			return false;
		}
		
		this.players[playerID].play_card();
		
		// In a war, we want the player to be marked as ready
		// if they play their last card.
		if (this.war && this.players[playerID].cards.length == 0) {
			this.players[playerID].hasPlayed = 4;
		}
		
		if (this.everyone_is_ready()) {
			var result = this.calculate_result();
			assert(result.length > 0);
			
			if (result.length > 1) {
				this.war = result;
			} else { // somebody won this round
				this.players[result[0]].cards.append(this.cards_in_play());
				this.clean_up_cards();
				
				this.prune_losers();
				if (this.players.length == 1) {
					winner = this.end_game();
					console.log(winner.name + " won the game!");
					return winner;
				}
			}
			
			this.reset_played_status();
			
			return result;
		}
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
		this.players = this.players.filter(function(player) {
			return player.cards.length > 0;
		});
	},
	
	end_game: function() {
		assert(this.players.length == 1);
		
		this.completed = true;
		return this.players[0];
	},
	
	reset_played_status: function() {
		this.players.each(function(player){
			player.hasPlayed = 0;
		});
	},
});
