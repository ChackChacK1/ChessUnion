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

    public enum SystemType {
        SWISS, ROUND_ROBIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String address;

    private String description;

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @OneToMany(mappedBy = "tournament", fetch = FetchType.LAZY)
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "tournament", fetch = FetchType.LAZY)
    private Set<Match> matches = new HashSet<>();

    @Column(name = "current_round")
    private int currentRound = 0;

    private Integer maxAmountOfPlayers;
    private Integer minAmountOfPlayers;

    @Column(name = "amount_of_rounds")
    private Integer amountOfRounds;

    @Enumerated(EnumType.STRING)
    private Stage stage = Stage.REGISTRATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_type")
    private SystemType systemType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
