package org.chessunion.controller;


import com.fasterxml.jackson.databind.deser.DataFormatReaders;
import lombok.RequiredArgsConstructor;
import org.chessunion.repository.MatchRepository;
import org.chessunion.service.MatchService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match")
@PreAuthorize("permitAll()")
@RequiredArgsConstructor
public class MatchController {
    private final MatchService matchService;


    @GetMapping("/all")
    public ResponseEntity<?> getAllMatches(@PageableDefault Pageable pageable) {
        return matchService.findAllMatches(pageable);
    }

    @GetMapping("/byTournament/{tournamentId}")
    public ResponseEntity<?> getTournamentMatches(@PathVariable int tournamentId, @PageableDefault Pageable pageable) {
        return matchService.findMatchesByTournament(tournamentId, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatchById(@PathVariable int id) {
        return matchService.findMatchById(id);
    }


}
