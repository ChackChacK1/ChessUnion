package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto implements Serializable {

    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String surName;
    private String phoneNumber;
    private String email;
    private Double rating;
    private Integer amountOfMatches;
    private Integer amountOfWins;
    private Integer amountOfLosses;
    private Integer amountOfDraws;
    private List<MatchDto> matches;
    private LocalDateTime createdAt;
}
