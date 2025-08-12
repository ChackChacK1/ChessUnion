package org.chessunion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private Double score;

    @Column(name = "color_balance")
    private int colorBalance;

    @ManyToOne
    private User user;

    private Double rating;

    @OneToMany
    private Set<Match> matchesPlayed;

    @Column(name = "had_bye")
    private boolean hadBye; // Получал ли техническое очко

    public Double getSecondRating(){
        Double secondRating = 0.0;

        for (Match match : matchesPlayed){
            Player whitePlayer = match.getWhitePlayer();
            Player blackPlayer = match.getBlackPlayer();
            if (whitePlayer.equals(this)){
                secondRating += blackPlayer.getScore();
            } else{
                secondRating += whitePlayer.getScore();
            }
        }
        return secondRating;
    }
}
