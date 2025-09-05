package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.*;
import org.chessunion.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

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
    @PatchMapping("/changePassword")
    public ResponseEntity<String> changePassword(Principal principal, @RequestBody ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(principal, changePasswordRequest.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/setAdmin")
    public ResponseEntity<String> setAdmin(@RequestBody PromoteToAdminDto promoteToAdminDto) {
        userService.promoteToAdmin(promoteToAdminDto.getUsername());
        return ResponseEntity.ok("Admin promoted successfully");
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

    @PreAuthorize("permitAll()")
    @GetMapping("/top")
    public ResponseEntity<List<TopListElementDto>> getTopList(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(userService.getTopList(pageable));
    }
}
