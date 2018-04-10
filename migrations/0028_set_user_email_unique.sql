-- +migrate Up
create unique index idx_user_email on "user"(email);

-- +migrate Down
drop index idx_user_email;

-- +migrate StatementEnd