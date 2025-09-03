package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.PlayerDto;
import org.chessunion.entity.Match;
import org.chessunion.entity.Player;
import org.chessunion.exception.PlayerNotFoundException;
import org.chessunion.repository.MatchRepository;
import org.chessunion.repository.PlayerRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ModelMapper modelMapper;

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

    public Set<Integer> getAllOpponentIds(Player player) {
        // Получаем только ID противников - это быстрее и безопаснее
        Set<Integer> opponentIds = new HashSet<>();
        List<Object[]> results = matchRepository.findOpponentIdsByPlayerId(player.getId());

        for (Object[] result : results) {
            Integer whiteId = (Integer) result[0];
            Integer blackId = (Integer) result[1];

            if (player.getId().equals(whiteId)) {
                opponentIds.add(blackId);
            } else {
                opponentIds.add(whiteId);
            }
        }
        return opponentIds;
    }

    public void deletePlayerById(Integer playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new PlayerNotFoundException(playerId));
        playerRepository.delete(player);
    }

    public List<PlayerDto> getAllPlayersOfTournament(Integer tournamentId) {
        return playerRepository.findAllByTournament_Id(tournamentId).stream()
                .map(player -> {
                    PlayerDto playerDto = modelMapper.map(player, PlayerDto.class);
                    playerDto.setFullName(getFullName(player));
                    return playerDto;
                    })
                .toList();
    }
}
