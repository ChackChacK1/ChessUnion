package org.chessunion.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopListElementDto implements Serializable {
    private String fullName;
    private Integer rating;
}
