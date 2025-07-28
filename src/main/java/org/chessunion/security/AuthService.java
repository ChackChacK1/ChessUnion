package org.chessunion.security;

import lombok.RequiredArgsConstructor;
import org.chessunion.dto.AuthRequest;
import org.chessunion.dto.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserUserDetailsService userUserDetailsService;

    public ResponseEntity<?> createToken(AuthRequest authRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getUsername(),
                        authRequest.getPassword()));
        UserDetails userDetails = userUserDetailsService.loadUserByUsername(authRequest.getUsername());
        AuthResponse authResponse = new AuthResponse(jwtUtil.generateToken(userDetails));
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }
}