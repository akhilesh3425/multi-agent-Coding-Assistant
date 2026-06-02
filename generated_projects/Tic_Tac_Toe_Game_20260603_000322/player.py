class Player:
    def __init__(self, name, symbol):
        self.name = name
        self.symbol = symbol

    def get_move(self):
        move = input(f"{self.name}, enter your move: ")
        return move

    def make_move(self, board, position):
        board[position] = self.symbol
