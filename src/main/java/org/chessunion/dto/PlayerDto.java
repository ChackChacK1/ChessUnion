package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDto implements Serializable {
    private Integer id;
    private String fullName;
    private Integer rating;
    private Double score;
    private String place;
    private Double secondScore;
    private Integer userId;
}
