package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchDto implements Serializable {
    private Integer id;
    private PlayerDto whitePlayer;
    private PlayerDto blackPlayer;
    private int roundNumber;
    private Double result;
}
