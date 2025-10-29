package org.chessunion.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.PhoneNumberConfirmationCodeRequest;
import org.chessunion.dto.PhoneNumberConfirmationRequest;
import org.chessunion.entity.PhoneNumber;
import org.chessunion.service.PhoneNumberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/phone/confirmation")
@PreAuthorize("permitAll()")
public class PhoneNumberController {
    private final PhoneNumberService phoneNumberService;

    @PostMapping("/send")
    public ResponseEntity<String> sendConfirmationCode (@RequestBody @Valid PhoneNumberConfirmationCodeRequest phoneNumber) {
        phoneNumberService.sendConfirmationCode(phoneNumber.getNumber());
        return ResponseEntity.ok("Code sent!");
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPhoneNumber(@RequestBody @Valid PhoneNumberConfirmationRequest phoneNumberConfirmationRequest) {
        phoneNumberService.confirmPhoneNumber(phoneNumberConfirmationRequest.getNumber(), phoneNumberConfirmationRequest.getCode());
        return ResponseEntity.ok("Code confirmed!");
    }
}
