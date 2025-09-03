package org.chessunion.exception;

public class NotEnoughPlayersException extends RuntimeException {
    public NotEnoughPlayersException(Integer have, Integer need) {
        super("Have: " + have + ", need: " + need);
    }
}
