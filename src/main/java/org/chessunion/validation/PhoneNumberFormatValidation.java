package org.chessunion.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PhoneNumberFormatValidator.class)
public @interface PhoneNumberFormatValidation {

    String message() default "Phone number is in invalid format. Right formats are +71234567890 or 81234567890";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}