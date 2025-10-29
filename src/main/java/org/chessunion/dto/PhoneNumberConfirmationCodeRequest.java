package org.chessunion.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.PhoneNumberFormatValidation;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumberConfirmationCodeRequest {

    @PhoneNumberFormatValidation
    private String number;
}
