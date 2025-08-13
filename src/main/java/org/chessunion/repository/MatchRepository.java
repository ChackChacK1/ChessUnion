package org.chessunion.repository;


import org.chessunion.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    public Optional<List<Match>> findMatchesByTournamentId(Integer tournamentId);
}
