package org.chessunion.repository;


import org.chessunion.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    public Optional<List<Match>> findMatchesByTournamentId(Integer tournamentId);


    @Query(value = "SELECT * FROM matches " +
            "WHERE black_player_id IN(SELECT id FROM players WHERE user_id = ?1) " +
            "or white_player_id IN(SELECT id FROM players WHERE user_id = ?1)", nativeQuery = true)
    List<Match> findAllMatchesByUserId(Integer userId);


}
