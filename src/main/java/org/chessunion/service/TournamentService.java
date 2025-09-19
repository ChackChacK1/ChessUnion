package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.*;
import org.chessunion.entity.*;
import org.chessunion.exception.NotEnoughPlayersException;
import org.chessunion.exception.TooManyPlayersException;
import org.chessunion.exception.TournamentNotFoundException;
import org.chessunion.exception.UserAlreadyRegisteredTournamentException;
import org.chessunion.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

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
    private final TransliterationService transliterationService;
    private final PlayerHistoryService playerHistoryService;
    private final PlayerHistoryRepository playerHistoryRepository;
    private final MatchRepository matchRepository;

    public List<TournamentDto> getAllTournaments(Pageable pageable) {
        return tournamentRepository.findAll().stream()
                .sorted(Comparator.comparing(Tournament::getStartDateTime))
                .map(this::tournamentToDto).toList();
    }

    @Transactional
    public void createTournament(TournamentCreateRequest tournamentCreateRequest) {
        Tournament tournament = modelMapper.map(tournamentCreateRequest, Tournament.class);
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setCurrentRound(0);
        tournament.setStage(Tournament.Stage.REGISTRATION);

        tournamentRepository.save(tournament);
    }

    @Transactional
    public void updateTournament(int id, UpdateTournamentDto updateTournamentDto){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));

        modelMapper.map(updateTournamentDto, tournament);

        tournamentRepository.save(tournament);
    }

    @Transactional
    public void registrationTournament(String username, int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));

        if (tournament.getPlayers().size() >= tournament.getMaxAmountOfPlayers()){
            throw new TooManyPlayersException(tournament.getPlayers().size(), tournament.getMaxAmountOfPlayers());
        }

        User user = userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        boolean alreadyRegistered = playerRepository.existsByUserAndTournament(user, tournament);
        if (alreadyRegistered) {
            throw new UserAlreadyRegisteredTournamentException("User id: " + user.getId());
        }

        Player player = new Player();
        player.setAmountOfDraws(user.getAmountOfDraws());
        player.setAmountOfWins(user.getAmountOfWins());
        player.setAmountOfLosses(user.getAmountOfLosses());
        player.setAmountOfMatches(user.getAmountOfMatches());
        player.setRating(user.getRating());
        player.setUser(user);
        player.setTournament(tournament);
        player.setCreatedAt(LocalDateTime.now());

        playerRepository.save(player);
        List<Player> players = new ArrayList<>();
        players.add(player);

        tournament.setPlayers(players);
        tournamentRepository.save(tournament);
    }

    public TournamentDto findById(int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new TournamentNotFoundException(id));
        return tournamentToDto(tournament);
    }

    public boolean checkTournamentRegistered(String name, int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new TournamentNotFoundException(id));
        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException(name));

        return playerRepository.existsByUserAndTournament(user, tournament);
    }

    public List<TournamentDto> getRunningTournaments(Pageable pageable){
        List<Tournament> tournaments = tournamentRepository.findByStageNot(Tournament.Stage.FINISHED);

        return tournaments.stream()
                .map(this::tournamentToDto)
                .toList();
    }

    @Transactional
    public int generateNextRound(int id){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));
        if (tournament.getCurrentRound() == tournament.getAmountOfRounds() ) {
            tournament.setStage(Tournament.Stage.FINISHED);
            userService.saveRatings(tournament.getId());
            tournamentRepository.save(tournament);
            return tournament.getCurrentRound();
        }
        if (tournament.getPlayers().size() < tournament.getMinAmountOfPlayers()){
            throw new NotEnoughPlayersException(tournament.getPlayers().size(), tournament.getMinAmountOfPlayers());
        }
        if (tournament.getPlayers().size() > tournament.getMaxAmountOfPlayers()){
            throw new TooManyPlayersException(tournament.getPlayers().size(), tournament.getMinAmountOfPlayers());
        }


        if (tournament.getCurrentRound() == 0) {
            tournament.setCurrentRound(1);
            tournament.setStage(Tournament.Stage.PLAYING);
            generateFirstRound(tournament);
        } else {
            tournament.setCurrentRound(tournament.getCurrentRound() + 1);
            generateNonFirstRound(tournament);
        }
        tournamentRepository.save(tournament);
        return tournament.getCurrentRound();
    }

    @Transactional
    protected void generateFirstRound(Tournament tournament){
        List<Player> players = new ArrayList<>(tournament.getPlayers());
        players.sort(Comparator.comparingDouble(Player::getRating).reversed());

        if (players.size() % 2 != 0) {
            Player byePlayer = players.removeLast();
            byePlayer.setScore(byePlayer.getScore() + 1);
            byePlayer.setHadBye(true);
            PlayerHistory playerHistory = new PlayerHistory(tournament.getId(), byePlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());
            playerHistory.setHadByeChanges(true);
            playerHistory.setScoreChanges(1.0);
            playerHistoryRepository.save(playerHistory);
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

        // Загружаем всех противников для всех игроков
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
                PlayerHistory playerHistory = new PlayerHistory(tournament.getId(), byePlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());
                playerHistory.setHadByeChanges(true);
                playerHistory.setScoreChanges(1.0);
                playerHistoryRepository.save(playerHistory);
            } else {
                // если уже получал bye — ищем следующего кандидата
                for (int i = players.size() - 1; i >= 0; i--) {
                    Player candidate = players.get(i);
                    if (!candidate.isHadBye()) {
                        candidate.setScore(candidate.getScore() + 1);
                        candidate.setHadBye(true);
                        players.remove(i);
                        PlayerHistory playerHistory = new PlayerHistory(tournament.getId(), candidate.getId(), LocalDateTime.now(), tournament.getCurrentRound());
                        playerHistory.setHadByeChanges(true);
                        playerHistory.setScoreChanges(1.0);
                        playerHistoryRepository.save(playerHistory);
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

            Player bestMatch = getBestMatchPlayer(remainingPlayers, firstPlayerOpponents, firstPlayer);

            if (bestMatch != null) {
                if (firstPlayer.getColorBalance() > bestMatch.getColorBalance()) {
                    matchService.createMatch(firstPlayer, bestMatch, tournament);
                } else {
                    matchService.createMatch(bestMatch, firstPlayer, tournament);
                }
                remainingPlayers.remove(bestMatch);
            } else {
                firstPlayer.setScore(firstPlayer.getScore() + 1);
                PlayerHistory playerHistory = new PlayerHistory(tournament.getId(), firstPlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());
                playerHistory.setScoreChanges(1.0);
                playerHistoryRepository.save(playerHistory);
                playerRepository.save(firstPlayer);
            }
        }
    }

    @Transactional
    public void rollbackRound(int id){
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new TournamentNotFoundException(id));

        if (tournament.getCurrentRound() == 0 || tournament.getStage() == Tournament.Stage.REGISTRATION) {
            throw new IllegalArgumentException("cur round is 0 or stage is registration");
        }

        if (tournament.getStage() == Tournament.Stage.FINISHED){
            throw new IllegalStateException("tournament is finished");
        }

        int currentRound = tournament.getCurrentRound();

        List<Integer> matchIds = matchService.findMatchIdsByTournamentRound(tournament.getId(), currentRound);
        for (Integer matchId : matchIds) {
            matchService.deleteMatchById(matchId);
        }

        List<Integer> matchIdsOfPrevRound = matchService.findMatchIdsByTournamentRound(tournament.getId(), currentRound - 1);
        matchRepository.setResultNullToAllMatchesByIds(matchIdsOfPrevRound);
        playerHistoryService.rollbackOneRound(tournament.getId(), currentRound);


        tournament.setCurrentRound(currentRound - 1);
        if (tournament.getCurrentRound() == 0) {
            tournament.setStage(Tournament.Stage.REGISTRATION);
        }
        tournamentRepository.save(tournament);
    }

    private static Player getBestMatchPlayer(List<Player> remainingPlayers, Set<Integer> firstPlayerOpponents, Player firstPlayer) {
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
        return bestMatch;
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

    @Transactional
    public void registerCustomUser(int id, RegisterCustomUserRequest registerCustomUserRequest) {
        String fullName = registerCustomUserRequest.getFullName();
        String firstName = fullName.split(" ")[0];
        String lastName = fullName.split(" ")[1];
        List<User> userList = userRepository.findAllByFirstNameAndLastName(firstName, lastName);

        if (userList.isEmpty()) {
            RegistrationRequest registrationRequest = new RegistrationRequest();
            registrationRequest.setFirstName(firstName);
            registrationRequest.setLastName(lastName);
            String username = transliterationService.transliterate(firstName + lastName);
            registrationRequest.setUsername(username);
            registrationRequest.setPassword("12345678");
            userService.registerUser(registrationRequest);

            registrationTournament(username, id);
        } else if (userList.size() == 1) {
            User user = userList.getFirst();
            registrationTournament(user.getUsername(), id);
        } else {
            throw new RuntimeException("There are 2 or more users with this fullName!");
        }
    }
}
