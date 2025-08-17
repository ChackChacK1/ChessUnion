package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.entity.Tournament;
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
@SecurityRequirement(name = "BearerAuth")
public class TournamentAdminController {

    private final TournamentService tournamentService;

    @PostMapping("/create")
    public ResponseEntity<?> createNewTournament(@RequestBody TournamentCreateRequest tournamentCreateRequest) {
        return ResponseEntity.ok(tournamentService.createTournament(tournamentCreateRequest));
    }

    @PostMapping("/{id}/round")
    public ResponseEntity<?> generateNextTournamentRound(@PathVariable("id") int id) {
        return ResponseEntity.ok(generateNextTournamentRound(id));
    }

    @PostMapping("/{id}/results")
    public ResponseEntity<?> getResultsTournament(@PathVariable("id") int id) {
        return ResponseEntity.ok(id);
    }


}
