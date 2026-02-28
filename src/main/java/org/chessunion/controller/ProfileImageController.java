package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.service.ProfileImageService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.MalformedURLException;
import java.security.Principal;

@RestController
@RequestMapping("/api/profile_image")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class ProfileImageController {

    private final ProfileImageService profileImageService;

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> getProfileImage(@PathVariable int id) throws MalformedURLException {
        Resource resource = profileImageService.getProfileImage(id);
        return (resource == null) ? ResponseEntity.notFound().build() : ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.noStore())
                .body(resource);
    }

    @PostMapping()
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateProfileImage(@RequestParam("file") MultipartFile file, Principal principal) {
        profileImageService.saveProfileImage(file, principal);
        return ResponseEntity.ok("profile image updated");
    }
}
