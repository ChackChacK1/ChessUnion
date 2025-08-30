package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTournamentDto {
    private String name;
    private String address;
    private String description;
    private LocalDateTime startDateTime;
    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;
    private Integer amountOfRounds;
}
