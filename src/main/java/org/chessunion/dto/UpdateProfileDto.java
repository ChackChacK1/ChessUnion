package org.chessunion.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.UniqueUserValidation;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileDto {
    @UniqueUserValidation(message = "User with username %s already exists")
    private String username;

    private String firstName;
    private String lastName;
    private String surName;

    //todo НОМЕР ТЕЛЕФОНА

    @UniqueUserValidation(message = "User with email %s already exists")
    @Email
    private String email;
}
