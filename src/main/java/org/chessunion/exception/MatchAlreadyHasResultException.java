package org.chessunion.exception;

public class MatchAlreadyHasResultException extends RuntimeException {
    public MatchAlreadyHasResultException(String message) {
        super(message);
    }
}
