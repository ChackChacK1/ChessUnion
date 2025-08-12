package org.chessunion.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "white_player", referencedColumnName = "id")
    private Player whitePlayer;

    @ManyToOne
    @JoinColumn(name = "black_player", referencedColumnName = "id")
    private Player blackPlayer;

    @ManyToOne
    @JoinColumn(name = "tournament", referencedColumnName = "id")
    private Tournament tournament;

    @Column(name = "round_number")
    private int roundNumber;

    private Double result;

}
