package org.chessunion.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.chessunion.repository.PhoneNumberRepository;
import org.chessunion.service.PhoneNumberService;

@RequiredArgsConstructor
public class PhoneNumberFormatValidator implements ConstraintValidator<PhoneNumberFormatValidation, String> {

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        s = s.trim();

        if (s.length() == 11 && s.toCharArray()[0] == '8') {
            for (Character ch : s.toCharArray()) {
                if (!Character.isDigit(ch)){
                    return false;
                }
            }
            return true;
        } else if (s.length() == 12 && s.toCharArray()[0] == '+') {
            char[] chars = new char[11];
            s.getChars(1, 12, chars, 0);
            for (Character ch : chars) {
                if (!Character.isDigit(ch)){
                    return false;
                }
            }
            return true;
        }

        return false;
    }
}
