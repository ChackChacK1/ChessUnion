package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDto {
    private String fullName;
    private Integer rating;
    private Double score;
    private String place;
    private Double secondScore;
}
