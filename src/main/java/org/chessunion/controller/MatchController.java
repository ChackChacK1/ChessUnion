package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchDto;
import org.chessunion.entity.Match;
import org.chessunion.service.MatchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/match")
@PreAuthorize("permitAll()")
@RequiredArgsConstructor
public class MatchController {
    private final MatchService matchService;


    @GetMapping("/all")
    public ResponseEntity<List<MatchDto>> getAllMatches(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(matchService.findAllMatches(pageable));
    }

    @GetMapping("/byTournament/{tournamentId}")
    public ResponseEntity<Page<MatchDto>> getTournamentMatches(@PathVariable int tournamentId, @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(matchService.findMatchesByTournament(tournamentId, pageable));
    }

    @GetMapping("/byTournament/{tournamentId}/{roundId}")
    public ResponseEntity<List<MatchDto>> getTournamentMatchesRound(@PathVariable int tournamentId,
                                                  @PathVariable int roundId) {
        return ResponseEntity.ok(matchService.findMatchesByTournamentRound(tournamentId, roundId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable int id) {
        return ResponseEntity.ok(matchService.findMatchById(id));
    }


}
