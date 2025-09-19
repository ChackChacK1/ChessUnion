package org.chessunion.service;

import lombok.RequiredArgsConstructor;
import org.chessunion.entity.Player;
import org.chessunion.entity.PlayerHistory;
import org.chessunion.exception.PlayerNotFoundException;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.repository.PlayerHistoryRepository;
import org.chessunion.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerHistoryService {
    private final PlayerHistoryRepository playerHistoryRepository;
    private final PlayerRepository playerRepository;


    @Transactional
    public void rollbackOneRound(Integer tournamentId, Integer round) {

        List<PlayerHistory> playerHistoryList = playerHistoryRepository
                .findAllByTournamentIdAndRoundOfChanges(tournamentId, round)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentId));

        playerHistoryList.addAll(playerHistoryRepository
                .findAllByTournamentIdAndRoundOfChangesAndGeneratedWithRoundIsFalse(tournamentId, round - 1)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentId)));


        for (PlayerHistory playerHistory : playerHistoryList) {
            Player player = playerRepository.findById(playerHistory.getPlayerId()).orElseThrow(() -> new PlayerNotFoundException(playerHistory.getPlayerId()));
            player = rollbackMapPlayer(player, playerHistory);
            playerRepository.save(player);
        }
        deleteNotRelevantHistory(tournamentId, round);
    }

    @Transactional
    public void deleteNotRelevantHistory(Integer tournamentId, Integer round) {
        playerHistoryRepository.deleteByTournamentIdAndRoundOfChanges(tournamentId, round);
        playerHistoryRepository.deleteByTournamentIdAndRoundOfChangesAndGeneratedWithRoundIsFalse(tournamentId, round - 1);
    }


    public Player rollbackMapPlayer(Player player, PlayerHistory playerHistory){
        player.setRating(player.getRating() - playerHistory.getRatingChanges());
        player.setScore(player.getScore() - playerHistory.getScoreChanges());
        player.setAmountOfMatches(player.getAmountOfMatches() - playerHistory.getAmountOfMatchesChanges());
        player.setAmountOfLosses(player.getAmountOfLosses() - playerHistory.getAmountOfLossesChanges());
        player.setAmountOfDraws(player.getAmountOfDraws() - playerHistory.getAmountOfDrawsChanges());
        player.setAmountOfWins(player.getAmountOfWins() - playerHistory.getAmountOfWinsChanges());
        player.setColorBalance(player.getColorBalance() - playerHistory.getColorBalanceChanges());
        if (playerHistory.getHadByeChanges()){
            player.setHadBye(false);
        }

        return player;
    }

    @Transactional
    public void savePlayerDifference(Player whitePlayerBefore, Player whitePlayer, int tournamentId, int round) {
        PlayerHistory playerHistory = new PlayerHistory(tournamentId, whitePlayer.getId(), LocalDateTime.now(), round);

        playerHistory.setRatingChanges(whitePlayer.getRating() - whitePlayerBefore.getRating());
        playerHistory.setScoreChanges(whitePlayer.getScore() - whitePlayerBefore.getScore());

        playerHistory.setAmountOfMatchesChanges(whitePlayer.getAmountOfMatches() - whitePlayerBefore.getAmountOfMatches());
        playerHistory.setAmountOfLossesChanges(whitePlayer.getAmountOfLosses() - whitePlayerBefore.getAmountOfLosses());
        playerHistory.setAmountOfDrawsChanges(whitePlayer.getAmountOfDraws() - whitePlayerBefore.getAmountOfDraws());
        playerHistory.setAmountOfWinsChanges(whitePlayer.getAmountOfWins() - whitePlayerBefore.getAmountOfWins());

        playerHistory.setColorBalanceChanges(whitePlayer.getColorBalance() - whitePlayerBefore.getColorBalance());
        playerHistory.setHadByeChanges(whitePlayer.isHadBye() != whitePlayerBefore.isHadBye());

        playerHistoryRepository.save(playerHistory);
    }
}
