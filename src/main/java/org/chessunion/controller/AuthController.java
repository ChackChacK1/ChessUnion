package org.chessunion.controller;


import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.AuthRequest;
import org.chessunion.dto.AuthResponse;
import org.chessunion.dto.RegistrationRequest;
import org.chessunion.security.AuthService;
import org.chessunion.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@PreAuthorize("permitAll()")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;


    @PostMapping("/registration")
    public ResponseEntity<String> registration(@RequestBody @Valid RegistrationRequest registrationRequest) {
        userService.registerUser(registrationRequest);
        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(authService.createToken(authRequest));
    }
}
