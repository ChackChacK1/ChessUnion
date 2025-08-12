package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.entity.Player;
import org.chessunion.entity.Tournament;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final MatchService matchService;

    public void generateNextRound(Tournament tournament){
        if (tournament.getCurrentRound() == 0) {
            generateFirstRound(tournament);
        } else {
            generateNonFirstRound(tournament);
        }
        tournament.setCurrentRound(tournament.getCurrentRound() + 1);
    }

    private void generateFirstRound(Tournament tournament){
        List<Player> players = new ArrayList<>(tournament.getPlayers());
        players.sort(Comparator.comparingDouble(Player::getRating).reversed());

        if (players.size() % 2 != 0) {
            Player byePlayer = players.remove(players.size() - 1);
            byePlayer.setScore(byePlayer.getScore() + 1);
            byePlayer.setHadBye(true);
        }

        int half = players.size() / 2;
        List<Player> topGroup = players.subList(0, half);
        List<Player> bottomGroup = players.subList(half, players.size());

        for (int i = 0; i < half; i++) {
//            matchService.createMatch();
        }

    }


    private void generateNonFirstRound(Tournament tournament){

    }




}
