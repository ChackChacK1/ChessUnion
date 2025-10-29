package org.chessunion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "phone_numbers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumber {
    @Id
    private String number;

    private boolean confirmed = false;

    private boolean blocked = false;

    @Column(name = "unblock_time")
    private LocalDateTime unblockTime;

    @Column(name = "confirm_attempts")
    private Integer confirmAttempts = 0;

    @Column(name = "amount_of_blocks")
    private Integer amountOfBlocks = 0;

    @Column(name = "confirmation_code")
    private String confirmationCode;

    @Column(name = "being_used")
    private boolean beingUsed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
