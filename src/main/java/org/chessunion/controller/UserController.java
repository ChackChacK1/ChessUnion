package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.*;
import org.chessunion.service.UserService;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<ProfileDto> getUserProfile(Principal principal, @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(userService.getProfile(principal, pageable));
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/profile/{id}")
    public ResponseEntity<PublicProfileDto> getPublicUserProfile(@PathVariable(name = "id") int userId,
                                                                       @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(userService.getPublicUserProfile(userId, pageable));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/updateAboutSelf")
    public ResponseEntity<String> updateAboutSelf(Principal principal, @RequestBody(required = false) String aboutSelf) {
        return ResponseEntity.ok(userService.updateAboutSelf(principal, aboutSelf));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/update")
    public ResponseEntity<String> updateProfile(Principal principal, @RequestBody UpdateProfileDto updateProfileDto){
        userService.updateProfile(principal, updateProfileDto);
        return ResponseEntity.ok("Profile update successfully");
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/phone/update")
    public ResponseEntity<String> updatePhoneNumber(Principal principal, @RequestBody PhoneNumberConfirmationRequest phoneNumberConfirmationRequest){
        userService.updateUserPhoneNumber(principal.getName(),
                phoneNumberConfirmationRequest.getNumber(),
                phoneNumberConfirmationRequest.getCode());

        return ResponseEntity.ok("Phone number updated successfully");
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/top")
    public ResponseEntity<Page<TopListElementDto>> getTopList(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userService.getTopList(pageable));
    }
}
