package org.chessunion.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PhoneNumberConfirmedValidator.class)
public @interface PhoneNumberConfirmedValidation {

    String message() default "Number is not confirmed or blocked. Confirm the number, or try again later.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}