package org.chessunion.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.dto.UpdateTournamentDto;
import org.chessunion.entity.Tournament;
import org.chessunion.service.TournamentService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
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
        return tournamentService.createTournament(tournamentCreateRequest);
    }

    @PostMapping("/{id}/round")
    public ResponseEntity<?> generateNextTournamentRound(@PathVariable("id") int id) {
        return tournamentService.generateNextRound(id);
    }

    @GetMapping("/running")
    public ResponseEntity<?> getRunningTournaments(Pageable pageable){
        return tournamentService.getRunningTournaments(pageable);
    }

    @PatchMapping("/{id}/update")
    public ResponseEntity<?> updateTournament(@PathVariable int id,
                                              @RequestBody UpdateTournamentDto updateTournamentDto){
        tournamentService.updateTournament(id, updateTournamentDto);
        return new ResponseEntity<>("Tournament update successfully", HttpStatus.OK);
    }
}
