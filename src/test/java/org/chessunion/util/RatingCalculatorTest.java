package org.chessunion.util;

import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.exception.MatchHasNotResultException;
import org.chessunion.util.rating.RatingCalculator;
import org.chessunion.util.rating.SimpleRatingCalculator;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class RatingCalculatorTest {
    private static Match match;
    private static RatingCalculator ratingCalculator;

    @BeforeEach
    public void setUpBeforeClass() throws Exception {

        match = new Match();

        Player firstPlayer = new Player();
        firstPlayer.setId(1);
        firstPlayer.setScore(10.00);
        firstPlayer.setRating(1500.00);
        Player secondPlayer = new Player();
        secondPlayer.setId(2);
        secondPlayer.setScore(10.00);
        secondPlayer.setRating(1500.00);

        match.setWhitePlayer(firstPlayer);
        match.setBlackPlayer(secondPlayer);
    }

    @Test
    public void whiteWinTest() {
        match.setResult(1.0);

        ratingCalculator = new SimpleRatingCalculator();

        Match resultOfCalculation = ratingCalculator.calculate(match);

        Assertions.assertEquals(1515.00, resultOfCalculation.getWhitePlayer().getRating());
        Assertions.assertEquals(1485.00, resultOfCalculation.getBlackPlayer().getRating());
    }

    @Test
    public void blackWinTest() {
        match.setResult(0.0);

        ratingCalculator = new SimpleRatingCalculator();

        Match resultOfCalculation = ratingCalculator.calculate(match);

        Assertions.assertEquals(1485.00, resultOfCalculation.getWhitePlayer().getRating());
        Assertions.assertEquals(1515.00, resultOfCalculation.getBlackPlayer().getRating());
    }

    @Test
    public void tieTest() {
        match.setResult(0.5);

        ratingCalculator = new SimpleRatingCalculator();

        Match resultOfCalculation = ratingCalculator.calculate(match);

        Assertions.assertEquals(1500.00, resultOfCalculation.getWhitePlayer().getRating());
        Assertions.assertEquals(1500.00, resultOfCalculation.getBlackPlayer().getRating());
    }

    @Test
    public void noResultExceptionCatchTest() {
        ratingCalculator = new SimpleRatingCalculator();

        Assertions.assertThrows(MatchHasNotResultException.class, () -> ratingCalculator.calculate(match));
    }
}
