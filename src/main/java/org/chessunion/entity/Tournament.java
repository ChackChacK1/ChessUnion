package org.chessunion.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
    private Integer id;

    @OneToMany(mappedBy = "tournament", fetch = FetchType.LAZY)
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "tournament", fetch = FetchType.LAZY)
    private Set<Match> matches = new HashSet<>();

    @Column(name = "current_round")
    private int currentRound = 0;

    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;

    @Enumerated(EnumType.STRING)
    private Stage stage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
