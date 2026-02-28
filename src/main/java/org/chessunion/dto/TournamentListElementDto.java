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
public class TournamentListElementDto {
    private Integer id;
    private String name;
    private String address;
    private LocalDateTime startDateTime;
    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;
    private Integer playersRegistered;
    private Tournament.Stage stage;
    private LocalDateTime createdAt;
}
