package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("api/tournament")
@RequiredArgsConstructor
public class TournamentController {


    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getAllTournaments(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok("todo");
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getTournamentById(@PathVariable int id) {
        return ResponseEntity.ok("todo");
    }

    @PutMapping("/{id}/registration")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> registrationToTournament(Principal principal, @PathVariable int id) {
        return ResponseEntity.ok("");
    }


}
