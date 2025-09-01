package org.chessunion.repository;


import org.chessunion.entity.Player;
import org.chessunion.entity.Tournament;
import org.chessunion.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Integer> {
    boolean existsByUserAndTournament(User user, Tournament tournament);

    @EntityGraph(attributePaths = {"user"})
    List<Player> findAllByTournament_Id(Integer tournamentId);

}
