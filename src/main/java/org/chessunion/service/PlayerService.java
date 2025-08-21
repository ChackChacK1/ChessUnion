package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.repository.MatchRepository;
import org.chessunion.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    public String getFullName(Player player) {
        return player.getUser().getFirstName() + " " + player.getUser().getLastName();
    }

    public Double calculateSecondScore(Player player){
        List<Match> matchesPlayed = matchRepository.findAllMatchesByPlayerId(player.getId());

        Double secondRating = 0.0;


        for (Match match : matchesPlayed){
            Player whitePlayer = match.getWhitePlayer();
            Player blackPlayer = match.getBlackPlayer();
            if (whitePlayer.equals(player)){
                secondRating += blackPlayer.getScore();
            } else{
                secondRating += whitePlayer.getScore();
            }
        }
        return secondRating;
    }

    public Set<Player> getAllOpponents(Player player){
        Set<Player> result = new HashSet<>();
        List<Match> playerMatches = matchRepository.findAllMatchesByPlayerId(player.getId());

        for (Match match : playerMatches) {
            if (match.getWhitePlayer().equals(player)) {
                result.add(match.getBlackPlayer());
            } else {
                result.add(match.getWhitePlayer());
            }
        }
        return result;
    }
}
