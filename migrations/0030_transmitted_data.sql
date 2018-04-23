-- +migrate Up
create table transmitted_data (
  application_id bigint not null references application,
  transmitted_data bigint not null,
  transmitted_at timestamp with time zone not null,
  transmitted_type smallint not null,

  primary key(application_id, transmitted_at)
);

create index idx_transmitted_data_application_id on transmitted_data(application_id);

-- +migrate Down
drop index idx_transmitted_data_application_id;

drop table transmitted_data;