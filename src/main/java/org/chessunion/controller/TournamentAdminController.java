package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.service.TournamentService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tournament")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class TournamentAdminController {

    private final TournamentService tournamentService;

    @PostMapping("/create")
    public ResponseEntity<?> createNewTournament() {
        return ResponseEntity.ok("todo");
    }

    @PostMapping("/{id}/round")
    public ResponseEntity<?> getNewTournamentRound(@PathVariable("id") int id) {
        return ResponseEntity.ok(id);
    }

    @PostMapping("/{id}/results")
    public ResponseEntity<?> getResultsTournament(@PathVariable("id") int id) {
        return ResponseEntity.ok(id);
    }


}
