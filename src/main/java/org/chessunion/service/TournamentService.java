package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.*;
import org.chessunion.entity.*;
import org.chessunion.exception.*;
import org.chessunion.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
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

    public Page<TournamentListElementDto> getAllTournaments(Pageable pageable) {
        return tournamentRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::tournamentToListElementDto);

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
    public void deleteTournament(int id){
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new TournamentNotFoundException(id));

        if (tournament.getStage() == Tournament.Stage.FINISHED) {
            int currentRound = tournament.getCurrentRound();
            while (currentRound > 0) {
                playerHistoryService.rollbackOneRound(tournament.getId(), currentRound);
                currentRound--;
            }
            userService.saveRatings(tournament.getId());
        }
        // при необходимости — сначала удалить связанные матчи и игроков
        matchRepository.deleteAllByTournamentId(tournament.getId());
        playerRepository.deleteAllByTournamentId(tournament.getId());
        playerHistoryRepository.deleteAllByTournamentId(tournament.getId());

        tournamentRepository.delete(tournament);
    }

    @Transactional
    public void registrationTournament(String username, int id, boolean checkPhoneNumber){
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(()-> new TournamentNotFoundException(id));

        if (tournament.getPlayers().size() >= tournament.getMaxAmountOfPlayers()){
            throw new TooManyPlayersException(tournament.getPlayers().size(), tournament.getMaxAmountOfPlayers());
        }

        User user = userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        if (user.isBanned()) {
            throw new UserBannedException("You are not allowed to register to this tournament.");
        }


//        if (user.getPhoneNumber() == null && checkPhoneNumber) {
//            throw new PhoneNumberNotFoundException("You need to register a phone number");
//        }

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
    public void generateRoundsRoundRobin(Tournament tournament){
        List<Player> rotation = new ArrayList<>(tournament.getPlayers());
        rotation.sort(Comparator.comparingInt(Player::getId));
        
        if (rotation.size() % 2 != 0) {
            rotation.add(null);
        }

        int playersCount = rotation.size();
        if (playersCount < 2) {
            throw new NotEnoughPlayersException(rotation.size(), 2);
        }

        int roundIndex = tournament.getCurrentRound() - 1;
        int rotationsNeeded = playersCount - 1;
        int effectiveShift = roundIndex % rotationsNeeded;

        for (int r = 0; r < effectiveShift; r++) {
            List<Player> next = new ArrayList<>(playersCount);
            next.add(rotation.getFirst());                 // фиксированный игрок
            next.add(rotation.getLast());                  // последний встаёт вторым
            next.addAll(rotation.subList(1, playersCount - 1)); // остальные сдвигаются вправо
            rotation = next;
        }

        int half = playersCount / 2;
        for (int i = 0; i < half; i++) {
            Player p1 = rotation.get(i);
            Player p2 = rotation.get(playersCount - 1 - i);

            if (p1 == null || p2 == null) {
                Player byePlayer = p1 == null ? p2 : p1;
                if (byePlayer != null && !byePlayer.isHadBye()) {
                    byePlayer.setScore(byePlayer.getScore() + 1);
                    byePlayer.setHadBye(true);
                    PlayerHistory history = new PlayerHistory(
                            tournament.getId(),
                            byePlayer.getId(),
                            LocalDateTime.now(),
                            tournament.getCurrentRound()
                    );
                    history.setHadByeChanges(true);
                    history.setScoreChanges(1.0);
                    playerHistoryRepository.save(history);
                    playerRepository.save(byePlayer);
                }
                continue;
            }

            if (p1.getColorBalance() > p2.getColorBalance()) {
                matchService.createMatch(p1, p2, tournament);
            } else if (p1.getColorBalance() <= p2.getColorBalance()) {
                matchService.createMatch(p2, p1, tournament);
            }
        }
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

        if (tournament.getCurrentRound() == 0 && tournament.getSystemType() == Tournament.SystemType.ROUND_ROBIN) {
            tournament.setCurrentRound(1);
            tournament.setStage(Tournament.Stage.PLAYING);
            generateRoundsRoundRobin(tournament);
        } else if (tournament.getSystemType() == Tournament.SystemType.ROUND_ROBIN) {
            tournament.setCurrentRound(tournament.getCurrentRound() + 1);
            generateRoundsRoundRobin(tournament);
        }
        if (tournament.getCurrentRound() == 0 && tournament.getSystemType() == Tournament.SystemType.SWISS) {
            tournament.setCurrentRound(1);
            tournament.setStage(Tournament.Stage.PLAYING);
            generateFirstRound(tournament);
        } else if (tournament.getSystemType() == Tournament.SystemType.SWISS){
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

        List<MatchPair> pairs = new ArrayList<>();
        List<Player> unpairedPlayers = new ArrayList<>(players);

        Map<Boolean, List<MatchPair>> pairsMap = findPairsWithBacktracking(unpairedPlayers, opponentsMap, pairs, new HashSet<>());

        if (!pairsMap.keySet().iterator().next()) {
            System.out.println("Ошибка расчета жеребьёвки");
            throw new NotEnoughPlayersException(unpairedPlayers.size(), unpairedPlayers.size());
        } else {
            for (MatchPair pair : pairsMap.get(true)) {
                matchService.createMatch(pair.getWhitePlayer(), pair.getBlackPlayer(), tournament);
            }
        }

        // Используем итератор для безопасного удаления
//        List<Player> remainingPlayers = new ArrayList<>(players);
//
//        while (!remainingPlayers.isEmpty()) {
//            Player firstPlayer = remainingPlayers.removeFirst();
//            Set<Integer> firstPlayerOpponents = opponentsMap.get(firstPlayer.getId());
//
//            Player bestMatch = getBestMatchPlayer(remainingPlayers, firstPlayerOpponents, firstPlayer);
//
//            if (bestMatch != null) {
//                if (firstPlayer.getColorBalance() > bestMatch.getColorBalance()) {
//                    matchService.createMatch(firstPlayer, bestMatch, tournament);
//                } else {
//                    matchService.createMatch(bestMatch, firstPlayer, tournament);
//                }
//                remainingPlayers.remove(bestMatch);
//            } else {
//                firstPlayer.setScore(firstPlayer.getScore() + 1);
//                PlayerHistory playerHistory = new PlayerHistory(tournament.getId(), firstPlayer.getId(), LocalDateTime.now(), tournament.getCurrentRound());
//                playerHistory.setScoreChanges(1.0);
//                playerHistoryRepository.save(playerHistory);
//                playerRepository.save(firstPlayer);
//            }
//        }
    }

//    private static Player getBestMatchPlayer(List<Player> remainingPlayers, Set<Integer> firstPlayerOpponents, Player firstPlayer) {
//        Player bestMatch = null;
//        int bestColorDiff = Integer.MAX_VALUE;
//
//        for (Player candidate : remainingPlayers) {
//            // Проверяем по ID, а не по объектам
//            if (!firstPlayerOpponents.contains(candidate.getId())) {
//                int colorDiff = Math.abs(firstPlayer.getColorBalance() - candidate.getColorBalance());
//                if (colorDiff < bestColorDiff) {
//                    bestColorDiff = colorDiff;
//                    bestMatch = candidate;
//                }
//            }
//        }
//        return bestMatch;
//    }

    private Map<Boolean, List<MatchPair>> findPairsWithBacktracking(List<Player> players,
                                              Map<Integer, Set<Integer>> opponentsMap,
                                              List<MatchPair> pairs,
                                              Set<Integer> usedPlayers) {
        if (players.isEmpty()) return Map.of(true, pairs);

        Player current = players.getFirst();

        for (int i = 1; i < players.size(); i++) {
            Player candidate = players.get(i);


            if (!opponentsMap.get(current.getId()).contains(candidate.getId()) &&
                    !usedPlayers.contains(candidate.getId()) &&
                    !(
                            current.getColorBalance() == candidate.getColorBalance() && (current.getColorBalance() == 2 || current.getColorBalance() == -2)
                    ) && colorCompatibilityCheck(current, candidate)) {

                if (!colorCheck(current).keySet().iterator().next()) {
                    if (colorCheck(current).get(false) == 'w') {
                        pairs.add(new MatchPair(candidate, current));
                    } else {
                        pairs.add(new MatchPair(current, candidate));
                    }
                } else if (!colorCheck(candidate).keySet().iterator().next()) {
                    if (colorCheck(candidate).get(false) == 'b') {
                        pairs.add(new MatchPair(candidate, current));
                    } else {
                        pairs.add(new MatchPair(current, candidate));
                    }
                } else {
                    if (current.getColorBalance() > candidate.getColorBalance()) {
                        pairs.add(new MatchPair(current, candidate));
                    } else{
                        pairs.add(new MatchPair(candidate, current));
                    }
                }


                usedPlayers.add(current.getId());
                usedPlayers.add(candidate.getId());

                List<Player> remaining = new ArrayList<>(players);
                remaining.remove(current);
                remaining.remove(candidate);

                if (findPairsWithBacktracking(remaining, opponentsMap, pairs, usedPlayers).keySet().iterator().next()) {
                    return Map.of(true, pairs);
                }

                // Backtrack
                pairs.removeLast();
                usedPlayers.remove(current.getId());
                usedPlayers.remove(candidate.getId());
            }
        }

        return Map.of(false, pairs);
    }

    private Boolean colorCompatibilityCheck(Player player1, Player player2) {
        Map<Boolean, Character> colorCheckP1 = colorCheck(player1);
        Map<Boolean, Character> colorCheckP2 = colorCheck(player2);
        boolean keyP1 = colorCheckP1.keySet().iterator().next();
        boolean keyP2 = colorCheckP2.keySet().iterator().next();
        Character colorP1 = colorCheckP1.get(keyP1);
        Character colorP2 = colorCheckP2.get(keyP2);


        if (keyP1 && keyP2) {
            return true;
        } else if (!keyP2 && !keyP1) {
            if (colorP1 == colorP2) {
                return false;
            } else {
                return (colorP1 != 'b' || player2.getColorBalance() != 2) && (colorP1 != 'w' || player2.getColorBalance() != -2)
                        && (colorP2 != 'b' || player1.getColorBalance() != 2) && (colorP2 != 'w' || player1.getColorBalance() != -2);
            }
        } else {
            if (!keyP2) {
                return (colorP2 != 'b' || player1.getColorBalance() != 2) && (colorP2 != 'w' || player1.getColorBalance() != -2);
            } else {
                return (colorP1 != 'b' || player2.getColorBalance() != 2) && (colorP1 != 'w' || player2.getColorBalance() != -2);
            }
        }
    }

    private Map<Boolean, Character> colorCheck(Player player) {
        char[] colorHistory = player.getColorHistory().toCharArray();
        if (colorHistory.length < 2) {
            return Map.of(true, 'n');
        }
        if (colorHistory[colorHistory.length - 2] == colorHistory[colorHistory.length - 1]) {
            return Map.of(false, colorHistory[colorHistory.length - 1]);
        }
        return Map.of(true, 'n');
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



    private TournamentDto tournamentToDto(Tournament tournament) {
        TournamentDto dto = modelMapper.map(tournament, TournamentDto.class);

        List<PlayerDto> playerDtoList = tournament.getPlayers().stream()
                .map(player -> {
                    PlayerDto playerDto = modelMapper.map(player, PlayerDto.class);
                    playerDto.setUserId(player.getUser().getId());
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

    private TournamentListElementDto tournamentToListElementDto(Tournament tournament) {
        TournamentListElementDto tournamentListElementDto = modelMapper.map(tournament, TournamentListElementDto.class);
        tournamentListElementDto.setPlayersRegistered(tournament.getPlayers().size());
        return tournamentListElementDto;
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
            userService.registerCustomUser(registrationRequest);

            registrationTournament(username, id, false);
        } else if (userList.size() == 1) {
            User user = userList.getFirst();
            registrationTournament(user.getUsername(), id, false);
        } else {
            throw new RuntimeException("There are 2 or more users with this fullName!");
        }
    }
}
