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

    private Double score;

    @Column(name = "color_balance")
    private int colorBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Double rating;

    @ManyToOne(fetch = FetchType.LAZY)
    private Tournament tournament;

    @OneToMany(mappedBy = "whitePlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedWhite;

    @OneToMany(mappedBy = "blackPlayer", fetch = FetchType.LAZY)
    private Set<Match> matchesPlayedBlack;

    @Column(name = "had_bye")
    private boolean hadBye; // Получал ли техническое очко

    @Column(name = "created_at")
    private LocalDateTime createdAt;



    public Double getSecondRating(){
        Double secondRating = 0.0;
        Set<Match> matchesPlayed = matchesPlayedWhite;
        matchesPlayed.addAll(matchesPlayedBlack);


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

    public String getFullName(){
        return user.getFirstName() + " " + user.getLastName();
    }

    public Set<Player> getAllPlayers(){
        Set<Player> result = new HashSet<>();
        for (Match match : matchesPlayedWhite ){
            result.add(match.getBlackPlayer());
        }

        for (Match match : matchesPlayedBlack ){
            result.add(match.getWhitePlayer());
        }

        return result;
    }

    public boolean hasPlayedBefore(Player player){
        return this.getAllPlayers().contains(player);
    }

}
