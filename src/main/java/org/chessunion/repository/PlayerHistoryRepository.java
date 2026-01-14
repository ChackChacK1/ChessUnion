package org.chessunion.repository;

import org.chessunion.entity.Player;
import org.chessunion.entity.PlayerHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerHistoryRepository extends JpaRepository<PlayerHistory, Integer> {
    Optional<List<PlayerHistory>> findAllByTournamentIdAndRoundOfChanges(Integer tournamentId, Integer roundOfChanges);


    void deleteByTournamentIdAndRoundOfChanges(Integer tournamentId, Integer roundOfChanges);

    void deleteByTournamentIdAndRoundOfChangesAndGeneratedWithRoundIsFalse(Integer tournamentId, int roundOfChanges);

    void deleteAllByTournamentId(Integer tournamentId);

    Optional<List<PlayerHistory>> findAllByTournamentIdAndRoundOfChangesAndGeneratedWithRoundIsFalse(Integer tournamentId, int roundOfChanges);
}
