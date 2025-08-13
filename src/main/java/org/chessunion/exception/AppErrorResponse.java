package org.chessunion.exception;

import java.util.List;

public record AppErrorResponse (
        String error,
        String body,
        List<String> details
){
    public AppErrorResponse(String error, String body){
        this(error, body, null);
    }
}
