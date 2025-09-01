package org.chessunion.util.rating;

import lombok.RequiredArgsConstructor;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.exception.MatchHasNotResultException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SimpleRatingCalculator implements RatingCalculator {

    public Match calculate(Match match) {
        if (match.getResult() == null) {
            throw new MatchHasNotResultException("SimpleRatingCalculator.calculate");
        }
        Player playerWhite = match.getWhitePlayer();
        Player playerBlack = match.getBlackPlayer();
        Double ratingOfFirstPlayer = playerWhite.getRating();
        Double ratingOfSecondPlayer = playerBlack.getRating();

        double expectedRatingDifferenceOfFirstPlayer = 1 / (1 + Math.pow(10, (ratingOfSecondPlayer - ratingOfFirstPlayer) / 400));
        double expectedRatingDifferenceOfSecondPlayer = 1 / (1 + Math.pow(10, (ratingOfFirstPlayer - ratingOfSecondPlayer) / 400));

        double matchResult = match.getResult();

        playerWhite.setRating(ratingOfFirstPlayer + 30 * (matchResult - expectedRatingDifferenceOfFirstPlayer));
        matchResult = Math.abs(matchResult-1);
        playerBlack.setRating(ratingOfSecondPlayer + 30 * (matchResult - expectedRatingDifferenceOfSecondPlayer));

        match.setWhitePlayer(playerWhite);
        match.setBlackPlayer(playerBlack);

        return match;
    }
}
