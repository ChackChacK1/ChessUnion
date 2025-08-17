package org.chessunion.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TournamentCreateRequest {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private Integer minPlayers;
    private Integer maxPlayers;
}
