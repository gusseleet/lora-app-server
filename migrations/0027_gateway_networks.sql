-- +migrate Up
create table gateway_network (
	id bigserial primary key,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	name character varying (100) not null,
	description text not null,
	private_network bool not null,
	organization_id bigserial not null references organization on delete cascade,

	unique(name)
);

create table gateway_network_gateway (
	id bigserial primary key,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	gateway_mac bytea not null references gateway on delete cascade,
	gateway_network_id bigserial not null references gateway_network on delete cascade,

	unique(gateway_mac, gateway_network_id)
);

create index idx_gateway_network_gateway_gateway_mac on gateway_network_gateway(gateway_mac);
create index idx_gateway_network_gateway_gateway_network_id on gateway_network_gateway(gateway_network_id);

-- +migrate Down

drop index idx_gateway_network_gateway_gateway_mac;
drop index idx_gateway_network_gateway_gateway_network_id;

drop table gateway_network_gateway;
drop table gateway_network;

