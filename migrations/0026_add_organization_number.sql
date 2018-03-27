-- +migrate Up
delete from organization where id=1;

alter table organization
    add column org_nr character varying (100) not null default '';

insert into organization (
	created_at,
	updated_at,
	name,
	display_name,
	can_have_gateways,
	org_nr
) values(
	now(),
	now(),
	'loraserver',
	'LoRa Server',
	true,
	'19891110'
);

-- +migrate Down
alter table organization
    drop column org_nr;

-- +migrate StatementEnd