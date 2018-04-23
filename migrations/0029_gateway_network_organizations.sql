-- +migrate Up
create table gateway_network_organization (
	id bigserial primary key,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	organization_id bigint not null references "organization" on delete cascade,
	gateway_network_id bigserial not null references gateway_network on delete cascade,

	unique(organization_id, gateway_network_id)
);

create index idx_gateway_network_organization_organization_id on gateway_network_organization(organization_id);

-- +migrate Down

drop index idx_gateway_network_organization_organization_id;

drop table gateway_network_organization;

