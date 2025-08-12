package org.chessunion.util.rating;

import org.chessunion.entity.Match;

import java.util.List;

public interface RatingCalculator {

    public Match calculate(Match match);
}
