package org.chessunion.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.chessunion.repository.UserRepository;

@RequiredArgsConstructor
public class UniqueUserValidator implements ConstraintValidator<UniqueUserValidation, String> {
    private final UserRepository userRepository;

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        return !userRepository.existsByUsername(s) && !userRepository.existsByEmail(s);
    }
}
