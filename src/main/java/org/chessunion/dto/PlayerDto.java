package org.chessunion.dto;

import jakarta.persistence.*;
import org.chessunion.entity.Match;
import org.chessunion.entity.Tournament;
import org.chessunion.entity.User;

import java.time.LocalDateTime;
import java.util.Set;

public class PlayerDto {
    private Double score = 0.0;
    private String name;
    private Double rating;
    private Tournament tournament;
    private LocalDateTime createdAt;
}
