CREATE TABLE player_histories
(
    id                        INTEGER NOT NULL,
    player_id                 INTEGER,
    tournament_id             INTEGER,
    time                      TIMESTAMP WITHOUT TIME ZONE,
    rating_changes            DOUBLE PRECISION DEFAULT 0.0,
    score_changes             DOUBLE PRECISION DEFAULT 0.0,
    amount_of_matches_changes INTEGER DEFAULT 0,
    amount_of_wins_changes    INTEGER DEFAULT 0,
    amount_of_losses_changes  INTEGER DEFAULT 0,
    amount_of_draws_changes   INTEGER DEFAULT 0,
    color_balance_changes     INTEGER DEFAULT 0,
    had_bye_changes           BOOLEAN DEFAULT false,
    round_of_changes          INTEGER,
    CONSTRAINT pk_player_histories PRIMARY KEY (id)
);