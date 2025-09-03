package org.chessunion.exception;

public class PlayerNotFoundException extends RuntimeException {
    public PlayerNotFoundException(Integer playerId) {
        super(playerId.toString());
    }
}
