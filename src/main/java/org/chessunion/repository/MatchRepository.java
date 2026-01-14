package org.chessunion.repository;


import org.chessunion.entity.Match;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    Optional<Page<Match>> findMatchesByTournamentId(Integer tournamentId, Pageable pageable);


    @Query(value = "SELECT * FROM matches " +
            "WHERE black_player_id IN(SELECT id FROM players WHERE user_id = ?1) " +
            "or white_player_id IN(SELECT id FROM players WHERE user_id = ?1)", nativeQuery = true)
    List<Match> findAllMatchesByUserId(Integer userId);

    @Query("SELECT m FROM Match m WHERE m.whitePlayer.id = ?1 OR m.blackPlayer.id = ?1")
    List<Match> findAllMatchesByPlayerId(Integer playerId);

    List<Match> findAllByTournamentIdAndRoundNumber(Integer tournamentId, int roundNumber);

    @Query("SELECT m.whitePlayer.id, m.blackPlayer.id FROM Match m WHERE m.whitePlayer.id = ?1 OR m.blackPlayer.id = ?1")
    List<Object[]> findOpponentIdsByPlayerId(Integer playerId);

    @Modifying
    @Query(value = "UPDATE matches SET result = null WHERE id IN (?1)", nativeQuery = true)
    void setResultNullToAllMatchesByIds(List<Integer> ids);

    void deleteAllByTournamentId(Integer id);
}
