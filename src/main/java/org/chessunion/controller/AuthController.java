package org.chessunion.controller;


import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.AuthRequest;
import org.chessunion.security.AuthService;
import org.chessunion.service.UserService;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;


    @PermitAll
    @PostMapping("/registration")
    public ResponseEntity<?> registration(@RequestBody AuthRequest authRequest) {
        return userService.registerUser(authRequest);
    }

    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        return authService.createToken(authRequest);
    }
}
