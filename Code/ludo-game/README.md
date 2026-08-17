# Ludo Game

This is a simple implementation of the classic board game Ludo. The game allows players to move their pieces around the board based on dice rolls, with the objective of getting all their pieces to the finish line.

## Project Structure

```
ludo-game
├── src
│   ├── main.py          # Entry point of the game
│   ├── game
│   │   ├── board.py     # Manages the game board
│   │   ├── player.py    # Represents a player in the game
│   │   └── dice.py      # Simulates dice rolls
├── requirements.txt      # Lists project dependencies
└── README.md             # Project documentation
```

## Requirements

To run this project, you need to install the required dependencies. You can do this by running:

```
pip install -r requirements.txt
```

## How to Run the Game

1. Clone the repository or download the project files.
2. Navigate to the project directory.
3. Run the game using the following command:

```
python src/main.py
```

## Game Rules

- Each player starts with four pieces.
- Players take turns rolling the dice and moving their pieces accordingly.
- The first player to move all their pieces to the finish line wins the game.

Enjoy playing Ludo!