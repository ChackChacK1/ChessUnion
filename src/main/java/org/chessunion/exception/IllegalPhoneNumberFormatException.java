package org.chessunion.exception;

public class IllegalPhoneNumberFormatException extends RuntimeException {
    public IllegalPhoneNumberFormatException(String phoneNumber) {
        super(phoneNumber);
    }
}
