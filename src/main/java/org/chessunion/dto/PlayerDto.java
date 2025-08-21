package org.chessunion.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.entity.Match;
import org.chessunion.entity.Tournament;
import org.chessunion.entity.User;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDto {
    private String fullName;
    private Double rating;
    private Double score;
    private Double secondScore;
    private String place;
}
