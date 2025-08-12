package org.chessunion.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
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
    private Integer id;


    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;

    @Enumerated(EnumType.STRING)
    private Stage stage;

    @OneToMany
    private Set<Player> players = new HashSet<>();

    @OneToMany
    private Set<Match> matches = new HashSet<>();
}
