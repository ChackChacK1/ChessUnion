package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.DeleteUserRequest;
import org.chessunion.dto.ProfileDto;
import org.chessunion.dto.UpdateProfileDto;
import org.chessunion.service.UserService;
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
    public ResponseEntity<String> deleteUser(@RequestBody DeleteUserRequest deleteUserRequest) {
        userService.deleteUser(deleteUserRequest.getUsername());
        return ResponseEntity.ok("User deleted successfully");
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/email")
    public ResponseEntity<String> updateUserEmail(Principal principal, @RequestBody String email) {
        userService.updateEmail(principal.getName(), email);
        return ResponseEntity.ok(String.format("Email %s successfully been set to your account", email));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getUserProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/update")
    public ResponseEntity<String> updateProfile(Principal principal, @RequestBody UpdateProfileDto updateProfileDto){
        userService.updateProfile(principal, updateProfileDto);
        return ResponseEntity.ok("Profile update successfully");
    }
}
