package org.chessunion.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchDto;
import org.chessunion.dto.MatchResultSetRequest;
import org.chessunion.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/match")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class MatchAdminController {

    private final MatchService matchService;

    @PatchMapping("/setResults")
    public ResponseEntity<List<MatchDto>> setMatchResult(@RequestBody List<MatchResultSetRequest> matchResultsSet) {
        return ResponseEntity.ok(matchService.setResultToListOfMatches(matchResultsSet));
    }
}
