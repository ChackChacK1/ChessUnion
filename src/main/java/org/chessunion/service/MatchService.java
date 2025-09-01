package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchDto;
import org.chessunion.dto.PlayerDto;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.entity.Tournament;
import org.chessunion.exception.MatchAlreadyHasResultException;
import org.chessunion.exception.MatchNotFoundException;
import org.chessunion.exception.PlayersTournamentConflictException;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final SimpleRatingCalculator simpleRatingCalculator;
    private final PlayerRepository playerRepository;
    private final ModelMapper modelMapper;
    private final PlayerService playerService;


    @Transactional
    public void createMatch(Player firstPlayer, Player secondPlayer, Tournament tournament) {
        Match match = new Match();

        match.setTournament(tournament);
        match.setRoundNumber(tournament.getCurrentRound());
        match.setCreatedAt(LocalDateTime.now());


        firstPlayer.setColorBalance(firstPlayer.getColorBalance() - 1);
        secondPlayer.setColorBalance(secondPlayer.getColorBalance() + 1);

        match.setWhitePlayer(firstPlayer);
        match.setBlackPlayer(secondPlayer);

        //сохранение в бд
        playerRepository.save(firstPlayer);
        playerRepository.save(secondPlayer);
        matchRepository.save(match);

    }



    @Transactional
    public MatchDto setMatchResult(int id, double result) {
        Match match = matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id));
        if (match.getResult() != null) {
            throw new MatchAlreadyHasResultException(String.format("Match id: %s, has result: %s, tried to set: %s", id, match.getResult(), result));
        }
        if (result != 0.0 && result != 0.5 && result != 1.0) {
            throw new IllegalArgumentException("Not a valid match result: " + result);
        }

        match.setResult(result);
        match = simpleRatingCalculator.calculate(match);

        match.getWhitePlayer().addScore(result);
        match.getBlackPlayer().addScore(Math.abs(result - 1));

        playerRepository.save(match.getWhitePlayer());
        playerRepository.save(match.getBlackPlayer());
        matchRepository.save(match);

        return matchToMatchDto(match);
    }


    public List<MatchDto> findAllMatchesByUserId(Integer userId) {
        return matchRepository.findAllMatchesByUserId(userId).stream()
                .map(this::matchToMatchDto)
                .toList();
    }


    public MatchDto matchToMatchDto(Match match) {
        MatchDto matchDto = modelMapper.map(match, MatchDto.class);

        PlayerDto whitePlayer = modelMapper.map(match.getWhitePlayer(), PlayerDto.class);
        whitePlayer.setFullName(playerService.getFullName(match.getWhitePlayer()));

        PlayerDto blackPlayer = modelMapper.map(match.getBlackPlayer(), PlayerDto.class);
        blackPlayer.setFullName(playerService.getFullName(match.getBlackPlayer()));

        matchDto.setWhitePlayer(whitePlayer);
        matchDto.setBlackPlayer(blackPlayer);
        return matchDto;
    }



    public List<MatchDto> findAllMatches(Pageable pageable) {
        List<MatchDto> matchDtoS = matchRepository.findAll(pageable).stream()
                .map(this::matchToMatchDto)
                .toList();

        return matchDtoS;
    }




    public List<MatchDto> findMatchesByTournament(int tournamentId, Pageable pageable) {
        return matchRepository.findMatchesByTournamentId(tournamentId, pageable)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentId)).stream()
                .map(this::matchToMatchDto)
                .toList();
    }

    public List<MatchDto> findMatchesByTournamentRound(int tournamentId, int roundNumber, Pageable pageable) {
        return matchRepository.findAllByTournamentIdAndRoundNumber(tournamentId, roundNumber, pageable).stream()
                .map(this::matchToMatchDto)
                .toList();
    }




    public Match findMatchById(int id) {
        return matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id));
    }


}
