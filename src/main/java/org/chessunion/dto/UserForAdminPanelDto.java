package org.chessunion.dto;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.entity.Player;
import org.chessunion.entity.Role;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserForAdminPanelDto {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Integer rating;
    private Integer amountOfMatches;
    private Set<Role> roles;
    private boolean isBanned;
    private LocalDateTime unbanDate;
    private LocalDateTime createdAt;
}
