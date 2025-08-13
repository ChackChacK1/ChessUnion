package org.chessunion.dto;


import lombok.Data;

@Data
public class AuthRequest {
    private String login;  //либо username, либо email
    private String password;  //пароль для входа в аккаунт
}
