package org.chessunion.dto;


import lombok.Data;

@Data
public class AuthRequest {
    private String username;  //используется для входа в аккаунт и security
    private String password;  //пароль для входа в аккаунт
}
