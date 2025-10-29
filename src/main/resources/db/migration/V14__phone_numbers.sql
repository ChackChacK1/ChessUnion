CREATE TABLE phone_numbers
(
    number            VARCHAR(255) NOT NULL,
    confirmed         BOOLEAN      NOT NULL,
    blocked           BOOLEAN      NOT NULL,
    unblock_time      TIMESTAMP WITHOUT TIME ZONE,
    confirm_attempts  INTEGER,
    amount_of_blocks  INTEGER,
    confirmation_code VARCHAR(255),
    being_used        BOOLEAN,
    created_at        TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_phone_numbers PRIMARY KEY (number)
);

ALTER TABLE users
    ADD phone_number VARCHAR(255);
