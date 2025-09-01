package org.chessunion.exception;

public class UserAlreadyRegisteredTournamentException extends RuntimeException {
    public UserAlreadyRegisteredTournamentException(String message) {
        super(message);
    }
}
