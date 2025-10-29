package org.chessunion.exception;

public class PhoneNumberNotFoundException extends RuntimeException {
    public PhoneNumberNotFoundException(String phoneNumber) {
        super(phoneNumber);
    }
}
