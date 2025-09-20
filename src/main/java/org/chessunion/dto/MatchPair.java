package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.entity.Player;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchPair {
    private Player whitePlayer;
    private Player blackPlayer;
}
