CREATE SEQUENCE IF NOT EXISTS player_histories_id_seq;
ALTER TABLE player_histories
    ALTER COLUMN id SET NOT NULL;
ALTER TABLE player_histories
    ALTER COLUMN id SET DEFAULT nextval('player_histories_id_seq');

ALTER SEQUENCE player_histories_id_seq OWNED BY player_histories.id;