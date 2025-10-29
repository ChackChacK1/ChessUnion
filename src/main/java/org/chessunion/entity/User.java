package org.chessunion.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chessunion.validation.PhoneNumberFormatValidation;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 128)
    private String username;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "sur_name", length = 50)
    private String surName;

    @Column(length = 50)
    @Email
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(length = 128, nullable = false)
    private String password;

    @Column(nullable = false)
    private Double rating;

    @Column(name = "amount_of_matches", nullable = false)
    private Integer amountOfMatches;

    @Column(name = "amount_of_wins", nullable = false)
    private int amountOfWins;

    @Column(name = "amount_of_losses", nullable = false)
    private int amountOfLosses;

    @Column(name = "amount_of_draws", nullable = false)
    private int amountOfDraws;

    @ManyToMany
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @OneToMany(mappedBy = "user")
    private Set<Player> players;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
