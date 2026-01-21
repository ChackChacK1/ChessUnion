package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.entity.Tournament;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentDto {
    private Integer id;
    private List<PlayerDto> players;
    private String name;
    private String address;
    private String description;
    private LocalDateTime startDateTime;
    private int currentRound;
    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;
    private Integer amountOfRounds;
    private Tournament.Stage stage;
    private Tournament.SystemType systemType;
    private LocalDateTime createdAt;
}
