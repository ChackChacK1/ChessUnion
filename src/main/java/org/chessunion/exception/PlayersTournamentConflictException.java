package org.chessunion.exception;

public class PlayersTournamentConflictException extends RuntimeException {
    public PlayersTournamentConflictException(Integer player1, Integer player2) {
        super(player1 + ", " + player2);
    }
}
