package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.exception.MatchAlreadyHasResultException;
import org.chessunion.exception.MatchNotFoundException;
import org.chessunion.repository.MatchRepository;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.util.rating.SimpleRatingCalculator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final SimpleRatingCalculator simpleRatingCalculator;
    private final PlayerRepository playerRepository;

    public ResponseEntity<?> createMatch(Player firstPlayer, Player secondPlayer ) {
        Match match = new Match();

        if (firstPlayer.getColorBalance() > secondPlayer.getColorBalance()) {
            firstPlayer.setColorBalance(firstPlayer.getColorBalance() - 1);
            secondPlayer.setColorBalance(secondPlayer.getColorBalance() + 1);

            match.setPlayerBlack(firstPlayer);
            match.setPlayerWhite(secondPlayer);
        } else {
            firstPlayer.setColorBalance(firstPlayer.getColorBalance() + 1);
            secondPlayer.setColorBalance(secondPlayer.getColorBalance() - 1);

            match.setPlayerWhite(firstPlayer);
            match.setPlayerBlack(secondPlayer);
        }

        playerRepository.save(firstPlayer);
        playerRepository.save(secondPlayer);
        matchRepository.save(match);


        return new ResponseEntity<>(match, HttpStatus.CREATED);
    }

    public ResponseEntity<?> setMatchResult(int id, double result) {
        Match match = matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id));
        if (match.getResult() != null) {
            throw new MatchAlreadyHasResultException("Match with id " + id + " already has result " + match.getResult() + ". You tried to set: " + result + ".");
        }
        if (result != 0.0 && result != 0.5 && result != 1.0) {
            throw new IllegalArgumentException("Not a valid match result: " + result);
        }

        match.setResult(result);

        match = simpleRatingCalculator.calculate(match);

        playerRepository.save(match.getPlayerWhite());
        playerRepository.save(match.getPlayerBlack());
        matchRepository.save(match);

        return new ResponseEntity<>(match, HttpStatus.OK);
    }
}
