ALTER TABLE players
    ADD amount_of_draws INTEGER default 0;

ALTER TABLE players
    ADD amount_of_losses INTEGER default 0;

ALTER TABLE players
    ADD amount_of_matches INTEGER default 0;

ALTER TABLE players
    ADD amount_of_wins INTEGER default 0;

ALTER TABLE players
    ALTER COLUMN amount_of_draws SET NOT NULL;

ALTER TABLE users
    ADD amount_of_draws INTEGER default 0;

ALTER TABLE users
    ADD amount_of_losses INTEGER default 0;

ALTER TABLE users
    ADD amount_of_matches INTEGER default 0;

ALTER TABLE users
    ADD amount_of_wins INTEGER default 0;

ALTER TABLE users
    ALTER COLUMN amount_of_draws SET NOT NULL;

ALTER TABLE players
    ALTER COLUMN amount_of_losses SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN amount_of_losses SET NOT NULL;

ALTER TABLE players
    ALTER COLUMN amount_of_matches SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN amount_of_matches SET NOT NULL;

ALTER TABLE players
    ALTER COLUMN amount_of_wins SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN amount_of_wins SET NOT NULL;

UPDATE users SET amount_of_wins = 16, amount_of_matches = 28, amount_of_losses = 10, amount_of_draws = 2, rating = 1073 WHERE id = 1