package org.chessunion.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.NewsletterDto;
import org.chessunion.dto.PhoneNumberConfirmationCodeRequest;
import org.chessunion.dto.PhoneNumberConfirmationRequest;
import org.chessunion.service.PhoneNumberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/phone/admin")
@PreAuthorize("hasRole('ADMIN')")
public class PhoneNumberAdminController {
    private final PhoneNumberService phoneNumberService;

    @PostMapping("/send")
    public ResponseEntity<String> sendConfirmationCode (@RequestBody NewsletterDto newsletterDto) {
        phoneNumberService.sendNewsletter();
        return ResponseEntity.ok("Code sent!");
    }

}