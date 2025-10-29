package org.chessunion.exception;

public class PhoneNumberAlreadyConfirmedException extends RuntimeException {
    public PhoneNumberAlreadyConfirmedException(String phoneNumber) {
        super(phoneNumber);
    }
}
