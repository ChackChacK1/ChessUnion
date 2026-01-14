package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.RegisterCustomUserRequest;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.dto.TournamentDto;
import org.chessunion.dto.UpdateTournamentDto;
import org.chessunion.service.TournamentService;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tournament")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class TournamentAdminController {

    private final TournamentService tournamentService;

    @PostMapping("/create")
    public ResponseEntity<String> createNewTournament(@RequestBody TournamentCreateRequest tournamentCreateRequest) {
        tournamentService.createTournament(tournamentCreateRequest);
        return ResponseEntity.ok("Tournament created!");
    }

    @PostMapping("/{id}/round")
    public ResponseEntity<Integer> generateNextTournamentRound(@PathVariable("id") int id) {
        return ResponseEntity.ok(tournamentService.generateNextRound(id));
    }

    @GetMapping("/running")
    public ResponseEntity<List<TournamentDto>> getRunningTournaments(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(tournamentService.getRunningTournaments(pageable));
    }

    @PatchMapping("/{id}/update")
    public ResponseEntity<String> updateTournament(@PathVariable int id,
                                              @RequestBody UpdateTournamentDto updateTournamentDto){
        tournamentService.updateTournament(id, updateTournamentDto);
        return ResponseEntity.ok("Tournament update successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable int id){
        try {
            tournamentService.deleteTournament(id);
            return ResponseEntity.ok().build();
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/addUser")
    public ResponseEntity<String> registerCustomUser(@PathVariable int id, @RequestBody RegisterCustomUserRequest registerCustomUserRequest) {
        tournamentService.registerCustomUser(id, registerCustomUserRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PatchMapping("/{id}/rollback")
    public ResponseEntity<String> rollback(@PathVariable int id) {
        tournamentService.rollbackRound(id);
        return ResponseEntity.ok("Tournament rollback completed");
    }
}
