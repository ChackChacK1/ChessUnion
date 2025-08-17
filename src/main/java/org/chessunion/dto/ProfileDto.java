package org.chessunion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {

    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Double rating;
    private List<MatchDto> matches;
    private LocalDateTime createdAt;
}
