package org.chessunion.controller;

import com.fasterxml.jackson.databind.deser.DataFormatReaders;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchResultSetRequest;
import org.chessunion.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/match")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MatchAdminController {

    private final MatchService matchService;

    @PatchMapping("/{id}/setResult}")
    public ResponseEntity<?> setMatchResult(@PathVariable int id, @RequestBody MatchResultSetRequest matchResult) {
        return matchService.setMatchResult(id, matchResult.getResult());
    }
}
