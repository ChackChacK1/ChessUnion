package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.repository.UserRepository;
import org.chessunion.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/delete")
    public ResponseEntity<?> deleteUser(String username) {
        return userService.deleteUser(username);
    }
}
