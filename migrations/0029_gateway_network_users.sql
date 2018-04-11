-- +migrate Up
create table gateway_network_user (
	id bigserial primary key,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	user_id bigint not null references "user" on delete cascade,
	gateway_network_id bigserial not null references gateway_network on delete cascade,

	unique(user_id, gateway_network_id)
);

create index idx_gateway_network_user_user_id on gateway_network_user(user_id);

-- +migrate Down

drop index idx_gateway_network_user_user_id;

drop table gateway_network_user;

