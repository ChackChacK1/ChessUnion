package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.PlayerDto;
import org.chessunion.dto.TournamentCreateRequest;
import org.chessunion.dto.TournamentDto;
import org.chessunion.dto.UpdateTournamentDto;
import org.chessunion.entity.Player;
import org.chessunion.entity.Tournament;
import org.chessunion.entity.User;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.repository.TournamentRepository;
import org.chessunion.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TournamentService {

    private final MatchService matchService;
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;
    private final PlayerService playerService;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final UserService userService;

    public ResponseEntity<List<TournamentDto>> getAllTournaments(Pageable pageable) {
        return new ResponseEntity<>(tournamentRepository.findAll(pageable).stream()
                .map(this::tournamentToDto).toList(), HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> createTournament(TournamentCreateRequest tournamentCreateRequest) {
        Tournament tournament = modelMapper.map(tournamentCreateRequest, Tournament.class);
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setCurrentRound(0);
        tournament.setStage(Tournament.Stage.REGISTRATION);

        tournamentRepository.save(tournament);

        return new ResponseEntity<>("Tournament created!", HttpStatus.OK);
    }

    @Transactional
    public void updateTournament(int id, UpdateTournamentDto updateTournamentDto){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));

        modelMapper.map(updateTournamentDto, tournament);

        tournamentRepository.save(tournament);
    }

    @Transactional
    public ResponseEntity<?> registrationTournament(String username, int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));

        User user = userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        boolean alreadyRegistered = playerRepository.existsByUserAndTournament(user, tournament);
        if (alreadyRegistered) {
            return new ResponseEntity<>("User already registered in this tournament!", HttpStatus.BAD_REQUEST);
        }

        Player player = new Player();

        player.setUser(user);
        player.setRating(user.getRating());
        player.setTournament(tournament);
        player.setCreatedAt(LocalDateTime.now());

        playerRepository.save(player);
        List<Player> players = new ArrayList<>();
        players.add(player);

        tournament.setPlayers(players);
        tournamentRepository.save(tournament);


        return new ResponseEntity<>("Registration successful!", HttpStatus.OK);
    }

    public ResponseEntity<?> findById(int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new TournamentNotFoundException(id));
        return new ResponseEntity<>(tournamentToDto(tournament), HttpStatus.OK);
    }

    public ResponseEntity<?> checkTournamentRegistered(String name, int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new TournamentNotFoundException(id));
        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException(name));

        boolean registered = playerRepository.existsByUserAndTournament(user, tournament);
        return new ResponseEntity<>(registered, HttpStatus.OK);
    }

    public ResponseEntity<?> getRunningTournaments(Pageable pageable){
        List<Tournament> tournaments = tournamentRepository.findByStageNot(Tournament.Stage.FINISHED);

        List<TournamentDto> result = tournaments.stream()
                .map(this::tournamentToDto)
                .toList();

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> generateNextRound(int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));
        if (tournament.getCurrentRound() == tournament.getAmountOfRounds() ) {
            tournament.setStage(Tournament.Stage.FINISHED);
            userService.saveRatings(tournament.getId());
            tournamentRepository.save(tournament);
            return new ResponseEntity<>(tournament.getCurrentRound(), HttpStatus.OK);
        }
        tournament.setCurrentRound(tournament.getCurrentRound() + 1);
        if (tournament.getCurrentRound() == 0) {
            generateFirstRound(tournament);
        } else {
            generateNonFirstRound(tournament);
        }
        tournamentRepository.save(tournament);
        return new ResponseEntity<>(tournament.getCurrentRound(), HttpStatus.OK);
    }

    @Transactional
    protected void generateFirstRound(Tournament tournament){
        List<Player> players = new ArrayList<>(tournament.getPlayers());
        players.sort(Comparator.comparingDouble(Player::getRating).reversed());

        if (players.size() % 2 != 0) {
            Player byePlayer = players.removeLast();
            byePlayer.setScore(byePlayer.getScore() + 1);
            byePlayer.setHadBye(true);
        }

        int half = players.size() / 2;
        List<Player> topGroup = players.subList(0, half);
        List<Player> bottomGroup = players.subList(half, players.size());

        for (int i = 0; i < half; i++) {
            matchService.createMatch(topGroup.get(i), bottomGroup.get(i), tournament);
        }
    }

    @Transactional
    protected void generateNonFirstRound(Tournament tournament) {
        List<Player> players = new ArrayList<>(tournament.getPlayers());
        players.sort((p1, p2) -> {
            int scoreCompare = Double.compare(p2.getScore(), p1.getScore());
            return scoreCompare != 0 ? scoreCompare :
                    Double.compare(p2.getRating(), p1.getRating());
        });

        // Предзагружаем всех противников для всех игроков
        Map<Integer, Set<Integer>> opponentsMap = new HashMap<>();
        for (Player player : players) {
            opponentsMap.put(player.getId(), playerService.getAllOpponentIds(player));
        }

        if (players.size() % 2 != 0) {
            Player byePlayer = players.getLast(); // последний в списке
            if (!byePlayer.isHadBye()) {
                byePlayer.setScore(byePlayer.getScore() + 1);
                byePlayer.setHadBye(true);
                players.removeLast();
            } else {
                // если уже получал bye — ищем следующего кандидата
                for (int i = players.size() - 1; i >= 0; i--) {
                    Player candidate = players.get(i);
                    if (!candidate.isHadBye()) {
                        candidate.setScore(candidate.getScore() + 1);
                        candidate.setHadBye(true);
                        players.remove(i);
                        break;
                    }
                }
            }
        }

        // Используем итератор для безопасного удаления
        List<Player> remainingPlayers = new ArrayList<>(players);

        while (!remainingPlayers.isEmpty()) {
            Player firstPlayer = remainingPlayers.removeFirst();
            Set<Integer> firstPlayerOpponents = opponentsMap.get(firstPlayer.getId());

            Player bestMatch = null;
            int bestColorDiff = Integer.MAX_VALUE;

            for (Player candidate : remainingPlayers) {
                // Проверяем по ID, а не по объектам
                if (!firstPlayerOpponents.contains(candidate.getId())) {
                    int colorDiff = Math.abs(firstPlayer.getColorBalance() - candidate.getColorBalance());
                    if (colorDiff < bestColorDiff) {
                        bestColorDiff = colorDiff;
                        bestMatch = candidate;
                    }
                }
            }

            if (bestMatch != null) {
                if (firstPlayer.getColorBalance() > bestMatch.getColorBalance()) {
                    matchService.createMatch(firstPlayer, bestMatch, tournament);
                } else {
                    matchService.createMatch(bestMatch, firstPlayer, tournament);
                }
                remainingPlayers.remove(bestMatch);
            } else {
                firstPlayer.setScore(firstPlayer.getScore() + 1);
                playerRepository.save(firstPlayer);
            }
        }
    }

    public TournamentDto tournamentToDto(Tournament tournament) {
        TournamentDto dto = modelMapper.map(tournament, TournamentDto.class);

        List<PlayerDto> playerDtoList = tournament.getPlayers().stream()
                .map(player -> {
                    PlayerDto playerDto = modelMapper.map(player, PlayerDto.class);
                    playerDto.setSecondScore(playerService.calculateSecondScore(player));
                    playerDto.setFullName(playerService.getFullName(player));
                    return playerDto;
                })
                .sorted(Comparator.comparingDouble(PlayerDto::getScore)
                        .thenComparingDouble(PlayerDto::getSecondScore)
                        .reversed())
                .toList();

        dto.setPlayers(playerDtoList);
        return dto;
    }
}
