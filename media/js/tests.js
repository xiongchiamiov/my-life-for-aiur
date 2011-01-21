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
					result = game.take_turn(1);
				});
				
				it('should declare as winner the player with the highest fourth card', function() {
					expect(result).toEqual(player2);
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
				var result = game.take_turn(1);
				
				expect(result).toEqual(player1);
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