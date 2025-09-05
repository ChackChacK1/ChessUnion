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

        int whiteK = 40;
        int blackK = 40;

        if (playerWhite.getAmountOfMatches() > 30){
            if (playerWhite.getRating() < 2400) {
                whiteK = 20;
            } else {
                whiteK = 10;
            }
        }

        if (playerBlack.getAmountOfMatches() > 30){
            if (playerBlack.getRating() < 2400) {
                blackK = 20;
            } else {
                blackK = 10;
            }
        }
        playerWhite.setAmountOfMatches(playerWhite.getAmountOfMatches() + 1);
        playerBlack.setAmountOfMatches(playerBlack.getAmountOfMatches() + 1);

        if (matchResult == 1) {
            playerWhite.setAmountOfWins(playerWhite.getAmountOfWins() + 1);
            playerBlack.setAmountOfLosses(playerBlack.getAmountOfLosses() + 1);
        } else if (matchResult == 0.5){
             playerWhite.setAmountOfDraws(playerWhite.getAmountOfDraws() + 1);
             playerBlack.setAmountOfDraws(playerBlack.getAmountOfDraws() + 1);
        } else {
            playerWhite.setAmountOfLosses(playerWhite.getAmountOfLosses() + 1);
            playerBlack.setAmountOfWins(playerBlack.getAmountOfWins() + 1);
        }

        playerWhite.setRating(ratingOfFirstPlayer + whiteK * (matchResult - expectedRatingDifferenceOfFirstPlayer));
        matchResult = Math.abs(matchResult-1);
        playerBlack.setRating(ratingOfSecondPlayer + blackK * (matchResult - expectedRatingDifferenceOfSecondPlayer));

        match.setWhitePlayer(playerWhite);
        match.setBlackPlayer(playerBlack);

        return match;
    }
}
