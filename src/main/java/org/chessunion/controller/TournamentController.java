package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.service.TournamentService;
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

    private final TournamentService tournamentService;

    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getAllTournaments(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(tournamentService.getAllTournaments(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getTournamentById(@PathVariable int id) {
        return ResponseEntity.ok(tournamentService.findById(id));
    }

    @PutMapping("/{id}/registration")
    @PreAuthorize("hasRole('USER')")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<?> registrationToTournament(Principal principal, @PathVariable int id) {
        return ResponseEntity.ok(tournamentService.registrationTournament(principal.getName(), id));
    }



}
