package org.chessunion.util.rating;

import org.chessunion.entity.Match;

public interface RatingCalculator {
    Match calculate(Match match);
}
