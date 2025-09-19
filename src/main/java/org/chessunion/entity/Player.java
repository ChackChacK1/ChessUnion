package org.chessunion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    @Column(name = "amount_of_matches", nullable = false)
    private int amountOfMatches;

    @Column(name = "amount_of_wins", nullable = false)
    private int amountOfWins;

    @Column(name = "amount_of_losses", nullable = false)
    private int amountOfLosses;

    @Column(name = "amount_of_draws", nullable = false)
    private int amountOfDraws;

    @OneToMany(mappedBy = "whitePlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedWhite = new HashSet<>();

    @OneToMany(mappedBy = "blackPlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedBlack = new HashSet<>();

    @Column(name = "had_bye")
    private boolean hadBye = false; // Получал ли техническое очко

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Player(Player player) {
        this.id = player.getId();
        this.score = player.getScore();
        this.colorBalance = player.getColorBalance();
        this.user = player.getUser();
        this.rating = player.getRating();
        this.amountOfMatches = player.getAmountOfMatches();
        this.amountOfWins = player.getAmountOfWins();
        this.amountOfLosses = player.getAmountOfLosses();
        this.amountOfDraws = player.getAmountOfDraws();
        this.hadBye = player.isHadBye();
        this.createdAt = player.getCreatedAt();
        this.tournament = player.getTournament();
        this.matchesPlayedWhite = player.getMatchesPlayedWhite();
        this.matchesPlayedBlack = player.getMatchesPlayedBlack();
    }

    public void addScore(double score) {
        this.score += score;
    }
}
