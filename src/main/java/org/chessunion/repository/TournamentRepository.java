package org.chessunion.repository;


import org.chessunion.entity.Tournament;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    List<Tournament> findByStageNot(Tournament.Stage stage);

    List<Tournament> findByName(String name);
}
