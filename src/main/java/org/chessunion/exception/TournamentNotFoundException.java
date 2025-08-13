package org.chessunion.exception;

public class TournamentNotFoundException extends RuntimeException{
    public TournamentNotFoundException(int tournamentId) {
        super("Tournament " + tournamentId + " not found");
    }
}
