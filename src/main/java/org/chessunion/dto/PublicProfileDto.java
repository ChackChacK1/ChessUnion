package org.chessunion.dto;


import lombok.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class PublicProfileDto {
    private String firstName;
    private String lastName;
    private String surName;
    private String aboutSelf;
    private Double rating;
    private Integer amountOfMatches;
    private Integer amountOfWins;
    private Integer amountOfLosses;
    private Integer amountOfDraws;
    private Page<MatchDto> matches;
    private LocalDateTime createdAt;
}
