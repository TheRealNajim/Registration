class Player:
    def __init__(self, name):
        self.name = name
        self.position = 0
        self.pieces = [0, 0, 0, 0]  # Assuming 4 pieces per player

    def move_piece(self, piece_index, steps):
        if 0 <= piece_index < len(self.pieces):
            self.pieces[piece_index] += steps
            # Add logic to handle piece reaching the end or other game rules

    def get_position(self, piece_index):
        if 0 <= piece_index < len(self.pieces):
            return self.pieces[piece_index]
        return None

    def __str__(self):
        return f"Player: {self.name}, Positions: {self.pieces}"