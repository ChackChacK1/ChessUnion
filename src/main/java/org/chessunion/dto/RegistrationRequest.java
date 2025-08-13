package org.chessunion.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.UniqueUserValidation;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {

    @UniqueUserValidation(message = "User with username %s already exists")
    private String username;
    private String password;
    private String firstName;
    private String lastName;

    @UniqueUserValidation(message = "User with email %s already exists")
    @Email
    private String email;
}
