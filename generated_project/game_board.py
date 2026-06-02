class GameBoard:
    """Represents a 3x3 game board for tic‑tac‑toe like games.

    The board is stored internally as a flat list of nine elements indexed
    from 0 to 8.  Helper methods treat it as a 3×3 grid when displaying or
    checking win conditions.
    """

    def __init__(self):
        """Create a new board and initialise its cells to empty strings."""
        self.initialize_board()

    def initialize_board(self):
        """Set up an empty 3×3 board.

        The board is represented as a flat list of nine strings, each
        initially containing a single space character to denote an empty cell.
        """
        self.board = [" "] * 9

    def display_board(self):
        """Print the current board state in a human‑readable 3×3 format."""
        row_template = " {} | {} | {} "
        separator = "---+---+---"
        print(row_template.format(self.board[0], self.board[1], self.board[2]))
        print(separator)
        print(row_template.format(self.board[3], self.board[4], self.board[5]))
        print(separator)
        print(row_template.format(self.board[6], self.board[7], self.board[8]))

    def check_winner(self, player_symbol: str) -> bool:
        """Return ``True`` if *player_symbol* occupies any complete row, column,
        or diagonal.

        Parameters
        ----------
        player_symbol: str
            The symbol used by the player (e.g., ``'X'`` or ``'O'``).
        """
        # All possible winning index combinations for a 3×3 grid
        winning_combinations = [
            (0, 1, 2),  # top row
            (3, 4, 5),  # middle row
            (6, 7, 8),  # bottom row
            (0, 3, 6),  # left column
            (1, 4, 7),  # middle column
            (2, 5, 8),  # right column
            (0, 4, 8),  # diagonal top‑left to bottom‑right
            (2, 4, 6),  # diagonal top‑right to bottom‑left
        ]
        return any(all(self.board[i] == player_symbol for i in combo) for combo in winning_combinations)

    def check_draw(self) -> bool:
        """Return ``True`` if the board is full and no player has won.

        A draw occurs when every cell is occupied (i.e., not a space) and
        neither ``'X'`` nor ``'O'`` satisfies a winning combination.
        """
        if any(cell == " " for cell in self.board):
            return False
        # No empty cells – ensure there is no winner for either typical symbol.
        # The method does not assume specific symbols, so we simply verify that
        # no winning combination exists for any symbol present on the board.
        symbols = set(self.board) - {" "}
        for sym in symbols:
            if self.check_winner(sym):
                return False
        return True
