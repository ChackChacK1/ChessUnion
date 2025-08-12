package org.chessunion.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tournaments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    public enum Stage {
        REGISTRATION, PLAYING, FINISHED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "tournament")
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "tournament")
    private Set<Match> games = new HashSet<>();

    @Column(name = "current_round")
    private int currentRound = 0;

    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;

    @Enumerated(EnumType.STRING)
    private Stage stage;

}
