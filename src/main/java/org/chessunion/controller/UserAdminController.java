package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.BanDuration;
import org.chessunion.dto.UserForAdminPanelDto;
import org.chessunion.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/user")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class UserAdminController {

    private final UserService userService;


    @GetMapping("/list")
    public Page<UserForAdminPanelDto> getUsers(@PageableDefault Pageable pageable) {
        return userService.getAllUsersForAdminPanel(pageable);
    }

    @PostMapping("/ban/{id}")
    public void banUser(@PathVariable int id, @RequestBody(required = false) BanDuration banDuration) {
        if (banDuration == null) {
            userService.banUser(id);
        } else{
            userService.banUserUntil(id, LocalDateTime.now().plusDays(banDuration.getDurationDays()));
        }
    }

    @PostMapping("/unban/{id}")
    public void unbanUser(@PathVariable int id) {
        userService.unbanUser(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable int id) {
        userService.deleteById(id);
    }
}
