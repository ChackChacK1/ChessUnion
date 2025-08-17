package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.dto.TournamentDto;
import org.chessunion.entity.Player;
import org.chessunion.entity.Tournament;
import org.chessunion.entity.User;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.repository.TournamentRepository;
import org.hibernate.query.Page;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final MatchService matchService;
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;
    private final ModelMapper modelMapper;

    public ResponseEntity<List<TournamentDto>> getAllTournaments(Pageable pageable) {
        return new ResponseEntity<>(tournamentRepository.findAll(pageable).stream()
                .map(this::tournamentToDto).toList(), HttpStatus.OK);
    }

    public ResponseEntity<?> createTournament(TournamentCreateRequest tournamentCreateRequest) {
        Tournament tournament = new Tournament();

        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setMaxAmountOfPlayers(20);
        tournament.setMinAmountOfPlayers(8);


        return new ResponseEntity<>(tournamentRepository.save(tournament), HttpStatus.OK);
    }

    public ResponseEntity<?> generateNextRound(int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));
        if (tournament.getCurrentRound() == 0) {
            generateFirstRound(tournament);
        } else {
            generateNonFirstRound(tournament);
        }
        tournament.setCurrentRound(tournament.getCurrentRound() + 1);
        return new ResponseEntity<>(tournament.getCurrentRound(), HttpStatus.OK);
    }

    public ResponseEntity<?> registrationTournament(User user){
        Player player = new Player();

        player.setRating(player.getRating());
        return new ResponseEntity<>(playerRepository.save(player), HttpStatus.OK);
    }

    public ResponseEntity<?> findById(int id){
        Optional<Tournament> tournament = tournamentRepository.findById(id);
        return new ResponseEntity<>(tournament.orElse(null), HttpStatus.OK);
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
            matchService.createMatch(topGroup.get(i), bottomGroup.get(i));
        }
    }


    private void generateNonFirstRound(Tournament tournament) {
        LinkedList<Player> players = new LinkedList<>(tournament.getPlayers());
        players.sort((p1, p2) -> {
            int scoreCompare = Double.compare(p2.getScore(), p1.getScore());
            return scoreCompare != 0 ? scoreCompare :
                    Double.compare(p2.getRating(), p1.getRating());
        });

        while (players.size() > 0){
            Player firstPlayer = players.poll();
            boolean playerFound = false;
            for (Player p : players){
                if (!firstPlayer.hasPlayedBefore(p)){
                    matchService.createMatch(firstPlayer, p);
                    players.remove(p);
                    playerFound = true;
                }
            }
            if (!playerFound){
                firstPlayer.setScore(firstPlayer.getScore() + 1);
            }
        }
    }

    public TournamentDto tournamentToDto(Tournament tournament){
        TournamentDto dto = modelMapper.map(tournament, TournamentDto.class);

        return dto;
    }

}
