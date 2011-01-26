describe('Card', function() {
	var club_2;
	var hearts_14;
	
	beforeEach(function() {
		club_2 = new Card(2, 'club', 'green');
		hearts_14 = new Card(14, 'hearts', 'green');
	});
	
	it('should provide the url to an image of its face', function() {
		expect(club_2.face_image()).toEqual('images/club-2.png');
		expect(hearts_14.face_image()).toEqual('images/hearts-14.png');
	});
	
	it('should provide the url to an image of its back', function() {
		expect(club_2.back_image()).toEqual('images/green.png');
		expect(hearts_14.back_image()).toEqual('images/green.png');
	});
});

describe('Player', function() {
	var player;
	
	it('should have on less card after playing a card', function() {
		var player = new Player('player', [new Card(0), new Card(1), new Card(2)]);
		var length = player.cards.length;
		player.play_card();
		
		expect(player.cards.length).toEqual(length-1);
	});
});

describe('Game', function() {
	describe('When two players tie', function() {
		var game;
		var player1;
		var player2;
		
		beforeEach(function() {
			player1 = new Player('Player 1', [new Card(1)]);
			player2 = new Player('Player 2', [new Card(1)]);
			
			game = new Game([player1, player2]);
			game.take_turn(0);
			game.take_turn(1);
			game.calculate_turn_result();
		});
		
		it('should have a war', function() {
			expect(game.war).toBeTruthy();
		});
		
		it('should list all tied players in the war list', function() {
			expect(game.war).toContain(0);
			expect(game.war).toContain(1);
		});
		
		describe('and place three cards', function() {
			beforeEach(function() {
				// The last Card in each of these lists is going to be removed below,
				// but is here now so that the 'no more cards but we're in war' rule
				// doesn't get triggered.
				player1.cards.append([new Card(2), new Card(3), new Card(4), new Card(-1)]);
				player2.cards.append([new Card(5), new Card(6), new Card(7), new Card(-1)]);
				
				game.take_turn(0);
				game.take_turn(0);
				game.take_turn(0);
				game.take_turn(1);
				game.take_turn(1);
				game.take_turn(1);
			});
			
			describe('with the fourth pair of cards resulting being unequal', function() {
				var result;
				
				beforeEach(function() {
					player1.cards.pop();
					player1.cards.push(new Card(8));
					player2.cards.pop();
					player2.cards.push(new Card(9));
					
					game.take_turn(0);
					game.take_turn(1);
					result = game.calculate_turn_result();
				});
				
				it('should declare as winner the player with the highest fourth card', function() {
					expect(result).toEqual(1);
				});
				
				it('should give all played cards to the winner', function() {
					expect(player2.cards).toContain(new Card(1));
					expect(player2.cards).toContain(new Card(2));
					expect(player2.cards).toContain(new Card(3));
					expect(player2.cards).toContain(new Card(4));
					expect(player2.cards).toContain(new Card(5));
					expect(player2.cards).toContain(new Card(6));
					expect(player2.cards).toContain(new Card(7));
					expect(player2.cards).toContain(new Card(8));
					expect(player2.cards).toContain(new Card(9));
				});
				
				describe('when then followed by another uneven pair', function() {
					beforeEach(function() {
						player1.cards.push(new Card(11));
						player2.cards.unshift(new Card(10)); // cheat it to the front of the deck
						
						game.take_turn(0);
						game.take_turn(1);
						result = game.calculate_turn_result();
					});
					
					it('should declare as winner the player with the highest fourth card', function() {
						expect(result).toEqual(0);
					});
					
					it('should give all played cards to the winner', function() {
						expect(player1.cards).toContain(new Card(11));
						expect(player1.cards).toContain(new Card(10));
					});
				});
			});
		});
		
		describe('and one player only has one card', function() {
			beforeEach(function() {
				player1.cards.push(new Card(6));
				player2.cards.append([new Card(2), new Card(3), new Card(4), new Card(5)]);
			});
			
			it('should allow that player to play only that card', function() {
				game.take_turn(0);
				game.take_turn(1);
				game.take_turn(1);
				game.take_turn(1);
				game.take_turn(1);
				var result = game.calculate_turn_result();
				
				expect(result).toEqual(0);
			});
		});
	});
});

describe('deck generating', function() {
	it('should generate all the cards in a deck', function() {
		var deck = generate_deck(['green']);
		
		[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].each(function(value) {
			expect(
				deck.filter(function(card) {
					return card.value == value;
				}).map(function(card) {
					return card.suit;
				}).sort()
			).toEqual(['clubs', 'diamonds', 'hearts', 'spades']);
		});
	});
});

describe('PlayerView', function() {
	beforeEach(function() {
		setFixtures('<div id="player"> \
		                 <img class="draggable" /><img /> \
		                 <div class="counter" /> \
		             </div> \
		             <div id="playing-field"> \
		                 <img id="player-played" /> \
		             </div>');
	});
	
	it('should draw a non-empty deck', function() {
		var player = new Player('Player', [new Card(2, 'clubs', 'green')]);
		var playerView = new PlayerView(player, 'player');
		playerView.draw();
		
		expect($('jasmine-fixtures').getElement('img')).toHaveAttr('src', 'images/green.png');
	});
	
	it('should not draw an empty deck', function() {
		var player = new Player('Player', []);
		var playerView = new PlayerView(player, 'player');
		playerView.draw();
		
		// Unfortunately, jasmine-dom's toBeHidden() doesn't check for visibility.
		// This is fragile, as it expects nothing else, style-wise, to have been applied.
		// Another option would be to assign a class .hidden, and CSS-hide those.
		expect($('jasmine-fixtures').getElement('img')).toHaveAttr('style', 'visibility: hidden;');
	});
	
	it("should display the number of cards in the player's deck", function() {
		var player1 = new Player('Player 1', []);
		var playerView = new PlayerView(player1, 'player');
		playerView.draw();
		
		expect($('jasmine-fixtures').getElement('.counter').get('text')).toEqual('0');
		
		var player2 = new Player('Player 2', [new Card(), new Card(), new Card()]);
		var playerView = new PlayerView(player2, 'player');
		playerView.draw();
		
		expect($('jasmine-fixtures').getElement('.counter').get('text')).toEqual('3');
	});
});
