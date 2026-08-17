# FILE: /ludo-game/ludo-game/src/main.py
import random
from game.board import Board
from game.player import Player
from game.dice import Dice

class LudoGame:
    def __init__(self):
        self.board = Board()
        self.players = [Player(name=f'Player {i+1}') for i in range(4)]
        self.dice = Dice()
        self.current_player_index = 0

    def play(self):
        while not self.is_game_over():
            current_player = self.players[self.current_player_index]
            print(f"{current_player.name}'s turn.")
            input("Press Enter to roll the dice...")
            roll = self.dice.roll()
            print(f"{current_player.name} rolled a {roll}.")
            current_player.move(roll, self.board)
            self.current_player_index = (self.current_player_index + 1) % len(self.players)

        print("Game Over!")

    def is_game_over(self):
        # Check if any player has won
        return any(player.has_won() for player in self.players)

if __name__ == "__main__":
    game = LudoGame()
    game.play()