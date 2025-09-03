package org.chessunion.exception;

public class TooManyPlayersException extends RuntimeException {
    public TooManyPlayersException(Integer have, Integer need) {
        super("Have: " + have + ", max: " + need);
    }
}
