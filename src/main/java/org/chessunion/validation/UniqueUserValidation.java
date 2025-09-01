package org.chessunion.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = UniqueUserValidator.class)
public @interface UniqueUserValidation {

    String message() default "User with '%s' already exists";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}