package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.DeleteUserRequest;
import org.chessunion.repository.UserRepository;
import org.chessunion.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestBody DeleteUserRequest deleteUserRequest) {
        return userService.deleteUser(deleteUserRequest.getUsername());
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/email")
    public ResponseEntity<?> updateUserEmail(Principal principal, @RequestBody String email) {
        return userService.updateEmail(principal.getName(), email);
    }
}
