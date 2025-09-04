package org.chessunion.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopListElementDto {
    private String fullName;
    private Integer rating;
}
