package org.chessunion.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.chessunion.dto.PlayerDto;
import org.chessunion.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/player")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class PlayerAdminController {

    private final PlayerService playerService;


    @DeleteMapping("/{playerId}")
    public ResponseEntity<String> removePlayer(@PathVariable Integer playerId) {
        playerService.deletePlayerById(playerId);
        return ResponseEntity.ok("Player removed successfully");
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<PlayerDto>> getPlayersOfTournament(@PathVariable Integer tournamentId) {
        return ResponseEntity.ok(playerService.getAllPlayersOfTournament(tournamentId));
    }


}
