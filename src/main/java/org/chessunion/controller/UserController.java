package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.DeleteUserRequest;
import org.chessunion.dto.UpdateProfileDto;
import org.chessunion.repository.UserRepository;
import org.chessunion.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
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

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        return new ResponseEntity<>(userService.getProfile(principal), HttpStatus.OK);
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/update")
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody UpdateProfileDto updateProfileDto){
        userService.updateProfile(principal, updateProfileDto);
        return new ResponseEntity<>("Profile update successfully", HttpStatus.OK);
    }
}
