package org.chessunion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double score = 0.0;

    @Column(name = "color_balance")
    private int colorBalance = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user = new User();

    private Double rating;

    @ManyToOne(fetch = FetchType.LAZY)
    private Tournament tournament;

    @OneToMany(mappedBy = "whitePlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedWhite = new HashSet<>();

    @OneToMany(mappedBy = "blackPlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedBlack = new HashSet<>();

    @Column(name = "had_bye")
    private boolean hadBye = false; // Получал ли техническое очко

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
