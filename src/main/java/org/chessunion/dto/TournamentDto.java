package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.entity.Tournament;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentDto {
    private Integer id;
    private List<PlayerDto> players;
    private String name;
    private String description;
    private LocalDateTime startDateTime;
    private int currentRound;
    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;
    private Tournament.Stage stage;
    private LocalDateTime createdAt;
}
