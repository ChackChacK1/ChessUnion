package org.chessunion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "player_histories")
public class PlayerHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "player_id")
    private Integer playerId;

    @Column(name = "tournament_id")
    private Integer tournamentId;

    private LocalDateTime time;

    @Column(name = "rating_changes")
    private Double ratingChanges = 0.0;

    @Column(name = "score_changes")
    private Double scoreChanges = 0.0;

    @Column(name = "amount_of_matches_changes")
    private Integer amountOfMatchesChanges = 0;

    @Column(name = "amount_of_wins_changes")
    private Integer amountOfWinsChanges = 0;

    @Column(name = "amount_of_losses_changes")
    private Integer amountOfLossesChanges = 0;

    @Column(name = "amount_of_draws_changes")
    private Integer amountOfDrawsChanges = 0;

    @Column(name = "color_balance_changes")
    private Integer colorBalanceChanges = 0;

    @Column(name = "had_bye_changes")
    private Boolean hadByeChanges = false;

    @Column(name = "generated_with_round")
    private Boolean generatedWithRound = false;

    @Column(name = "round_of_changes")
    private int roundOfChanges;

    public PlayerHistory(Integer tournamentId, Integer playerId, LocalDateTime time, Integer currentRound) {
        this.time = time;
        this.tournamentId = tournamentId;
        this.playerId = playerId;
        this.roundOfChanges = currentRound;
    }
}
