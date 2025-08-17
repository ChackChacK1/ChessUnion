package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchDto implements Serializable {
    private String whitePlayerName;
    private String blackPlayerName;
    private Double result;
}
