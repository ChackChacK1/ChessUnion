package org.chessunion.exception;

public class PhoneNumberIsAlreadyBeingUsedException extends RuntimeException {
    public PhoneNumberIsAlreadyBeingUsedException(String number) {
        super(number);
    }
}
