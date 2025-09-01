package org.chessunion.security;

import lombok.RequiredArgsConstructor;
import org.chessunion.dto.AuthRequest;
import org.chessunion.dto.AuthResponse;
import org.chessunion.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserUserDetailsService userUserDetailsService;
    private final UserRepository userRepository;

    public AuthResponse createToken(AuthRequest authRequest) {
        String login;

        if (authRequest.getLogin().contains("@")){
            login = userRepository.findByEmail(authRequest.getLogin())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email")).getUsername();
        } else {
            login = authRequest.getLogin();
        }


        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        login,
                        authRequest.getPassword()));
        UserDetails userDetails = userUserDetailsService.loadUserByUsername(login);
        String role = userDetails.getAuthorities().toString();
        if (role.contains("ROLE_ADMIN")) {
            role = "ADMIN";
        } else {
            role = "USER";
        }
        return new AuthResponse(jwtUtil.generateToken(userDetails), role);
    }
}