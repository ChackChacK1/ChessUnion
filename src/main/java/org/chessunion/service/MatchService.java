package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.MatchDto;
import org.chessunion.dto.MatchResultSetRequest;
import org.chessunion.dto.PlayerDto;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.entity.PlayerHistory;
import org.chessunion.entity.Tournament;
import org.chessunion.exception.MatchAlreadyHasResultException;
import org.chessunion.exception.MatchNotFoundException;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.repository.MatchRepository;
import org.chessunion.repository.PlayerHistoryRepository;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.util.rating.SimpleRatingCalculator;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final PlayerHistoryRepository playerHistoryRepository;
    private final PlayerHistoryService playerHistoryService;


    @Transactional
    public void createMatch(Player firstPlayer, Player secondPlayer, Tournament tournament) {
        Match match = new Match();

        match.setTournament(tournament);
        match.setRoundNumber(tournament.getCurrentRound());
        match.setCreatedAt(LocalDateTime.now());

        PlayerHistory firstPlayerHistory = new PlayerHistory(tournament.getId(), firstPlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());
        PlayerHistory secondPlayerHistory = new PlayerHistory(tournament.getId(), secondPlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());

        firstPlayer.setColorBalance(firstPlayer.getColorBalance() - 1);
        firstPlayerHistory.setColorBalanceChanges(-1);
        firstPlayerHistory.setGeneratedWithRound(true);

        secondPlayer.setColorBalance(secondPlayer.getColorBalance() + 1);
        secondPlayerHistory.setColorBalanceChanges(1);
        secondPlayerHistory.setGeneratedWithRound(true);

        match.setWhitePlayer(firstPlayer);
        match.setBlackPlayer(secondPlayer);

        //сохранение в бд
        playerRepository.save(firstPlayer);
        playerRepository.save(secondPlayer);
        matchRepository.save(match);
        playerHistoryRepository.save(firstPlayerHistory);
        playerHistoryRepository.save(secondPlayerHistory);
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
        Player whitePlayerBefore = match.getWhitePlayer();
        Player blackPlayerBefore = match.getBlackPlayer();
        match = simpleRatingCalculator.calculate(match);

        match.getWhitePlayer().addScore(result);
        match.getBlackPlayer().addScore(Math.abs(result - 1));

        playerHistoryService.savePlayerDifference(whitePlayerBefore, match.getWhitePlayer(), match.getTournament().getId(), match.getTournament().getCurrentRound());
        playerHistoryService.savePlayerDifference(blackPlayerBefore, match.getBlackPlayer(), match.getTournament().getId(), match.getTournament().getCurrentRound());

        playerRepository.save(match.getWhitePlayer());
        playerRepository.save(match.getBlackPlayer());
        matchRepository.save(match);

        return matchToMatchDto(match);
    }

    @Transactional
    public List<MatchDto> setResultToListOfMatches(List<MatchResultSetRequest> matches) {
        List<MatchDto> matchDtoList = new ArrayList<>();
        for (MatchResultSetRequest match : matches) {
            matchDtoList.add(setMatchResult(match.getId(), match.getResult()));
        }
        return matchDtoList;
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
        return matchRepository.findAll(pageable).stream()
                .map(this::matchToMatchDto)
                .toList();
    }




    public List<MatchDto> findMatchesByTournament(int tournamentId, Pageable pageable) {
        return matchRepository.findMatchesByTournamentId(tournamentId, pageable)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentId)).stream()
                .map(this::matchToMatchDto)
                .toList();
    }

    public List<MatchDto> findMatchesByTournamentRound(int tournamentId, int roundNumber) {
        return matchRepository.findAllByTournamentIdAndRoundNumber(tournamentId, roundNumber).stream()
                .map(this::matchToMatchDto)
                .toList();
    }

    public List<Integer> findMatchIdsByTournamentRound(int tournamentId, int roundNumber) {
        return matchRepository.findAllByTournamentIdAndRoundNumber(tournamentId, roundNumber).stream()
                .map(Match::getId)
                .toList();
    }

    @Transactional
    public void deleteMatchById(int id) {
        matchRepository.deleteById(id);
    }



    public Match findMatchById(int id) {
        return matchRepository.findById(id).orElseThrow(() -> new MatchNotFoundException(id));
    }


}
