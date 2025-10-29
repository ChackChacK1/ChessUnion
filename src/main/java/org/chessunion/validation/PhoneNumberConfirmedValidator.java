package org.chessunion.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.chessunion.repository.PhoneNumberRepository;
import org.chessunion.repository.UserRepository;
import org.chessunion.service.PhoneNumberService;

@RequiredArgsConstructor
public class PhoneNumberConfirmedValidator implements ConstraintValidator<PhoneNumberConfirmedValidation, String> {
    private final PhoneNumberRepository phoneNumberRepository;
    private final PhoneNumberService phoneNumberService;

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        return phoneNumberService.isNumberConfirmed(s);
    }
}
