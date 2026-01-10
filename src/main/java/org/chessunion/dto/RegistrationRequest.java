package org.chessunion.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.PhoneNumberConfirmedValidation;
import org.chessunion.validation.PhoneNumberFormatValidation;
import org.chessunion.validation.UniqueUserValidation;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {

    @UniqueUserValidation(message = "Логин уже используется.")
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String surName;

//    @PhoneNumberFormatValidation
//    @PhoneNumberConfirmedValidation
    private String phoneNumber;

    private String confirmationCode;

    @Email
    private String email;
}
