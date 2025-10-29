package org.chessunion.exception;

import java.time.LocalDateTime;

public class PhoneNumberIsBlockedException extends RuntimeException {
    public PhoneNumberIsBlockedException(LocalDateTime unblockTime) {
        super(unblockTime.toString());
    }
}
