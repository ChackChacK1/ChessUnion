package org.chessunion.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.PhoneNumberFormatValidation;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumberConfirmationRequest {

    @PhoneNumberFormatValidation
    private String number;
    private String code;
}
