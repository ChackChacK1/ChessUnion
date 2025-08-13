package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchDto;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.exception.MatchAlreadyHasResultException;
import org.chessunion.exception.MatchNotFoundException;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.repository.MatchRepository;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.util.rating.SimpleRatingCalculator;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final SimpleRatingCalculator simpleRatingCalculator;
    private final PlayerRepository playerRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ResponseEntity<?> createMatch(Player firstPlayer, Player secondPlayer) {
        Match match = new Match();


        /*Проверка на баланс цветов
          Если коэффициенты равны, то белыми играет первый игрок(firstPlayer) */
        if (firstPlayer.getColorBalance() > secondPlayer.getColorBalance()) {
            firstPlayer.setColorBalance(firstPlayer.getColorBalance() - 1);
            secondPlayer.setColorBalance(secondPlayer.getColorBalance() + 1);

            match.setBlackPlayer(firstPlayer);
            match.setWhitePlayer(secondPlayer);
        } else {
            firstPlayer.setColorBalance(firstPlayer.getColorBalance() + 1);
            secondPlayer.setColorBalance(secondPlayer.getColorBalance() - 1);

            match.setWhitePlayer(firstPlayer);
            match.setBlackPlayer(secondPlayer);
        }

        //сохранение в бд
        playerRepository.save(firstPlayer);
        playerRepository.save(secondPlayer);
        matchRepository.save(match);

        return new ResponseEntity<>(matchToMatchDto(match), HttpStatus.CREATED);
    }



    @Transactional
    public ResponseEntity<?> setMatchResult(int id, double result) {
        Match match = matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id));
        if (match.getResult() != null) {
            throw new MatchAlreadyHasResultException(String.format("Match id: %s, has result: %s, tried to set: %s", id, match.getResult(), result));
        }
        if (result != 0.0 && result != 0.5 && result != 1.0) {
            throw new IllegalArgumentException("Not a valid match result: " + result);
        }

        match.setResult(result);

        match = simpleRatingCalculator.calculate(match);

        playerRepository.save(match.getWhitePlayer());
        playerRepository.save(match.getBlackPlayer());
        matchRepository.save(match);

        return new ResponseEntity<>(matchToMatchDto(match), HttpStatus.OK);
    }





    public MatchDto matchToMatchDto(Match match) {
        MatchDto matchDto = modelMapper.map(match, MatchDto.class);
        matchDto.setWhitePlayerName(match.getWhitePlayer().getFullName());
        matchDto.setBlackPlayerName(match.getBlackPlayer().getFullName());
        return matchDto;
    }




    public ResponseEntity<?> findAllMatches(Pageable pageable) {
        return new ResponseEntity<>(matchRepository.findAll(pageable), HttpStatus.OK);
    }




    public ResponseEntity<?> findMatchesByTournament(int tournamentId) {
        return new ResponseEntity<>(matchRepository.findMatchesByTournamentId(tournamentId)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentId)),
                HttpStatus.OK);
    }




    public ResponseEntity<?> findMatchById(int id) {
        return new ResponseEntity<>(matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id)), HttpStatus.OK);
    }
}
