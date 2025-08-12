package org.chessunion.exception;

public class MatchNotFoundException extends RuntimeException {
    public MatchNotFoundException(Integer id) {
        super(Integer.toString(id));
    }
}
