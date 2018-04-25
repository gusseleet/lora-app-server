-- +migrate Up
create table payment_plan (
  id bigserial primary key,
  name character varying (100) not null,
  data_limit smallint not null,
  nr_of_allowed_devices smallint not null,
  nr_of_allowed_apps smallint not null,
  fixed_price smallint not null,
  added_data_price smallint not null,
  organization_id bigserial not null references organization on delete cascade
);

create index idx_payment_plan_id on payment_plan(id);

create table gateway_network_to_payment_plan (
  gw_id bigserial not null references gateway_network on delete cascade,
  pay_plan_id bigserial not null references payment_plan on delete cascade,

  primary key(gw_id, pay_plan_id)
);

create index idx_gateway_network_to_payment_plan_gw_id on gateway_network_to_payment_plan(gw_id);
create index idx_gateway_network_to_payment_plan_pay_plan_id on gateway_network_to_payment_plan(pay_plan_id);

-- +migrate Down

drop index idx_payment_plan_id;
drop index idx_gateway_network_to_payment_plan_gw_id;
drop index idx_gateway_network_to_payment_plan_pay_plan_id;

drop table gateway_network_to_payment_plan;
drop table payment_plan;