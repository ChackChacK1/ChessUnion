package org.chessunion.controller;


import com.fasterxml.jackson.databind.deser.DataFormatReaders;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/all")
    public ResponseEntity<?> getAllMatches(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok("pageble");
    }

    @GetMapping("/byTournament/{tournamentId}")
    public ResponseEntity<?> getTournamentMatches(@PathVariable int tournamentId) {
        return ResponseEntity.ok("matches");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatchById(@PathVariable int id) {
        return ResponseEntity.ok("matches");
    }


}
