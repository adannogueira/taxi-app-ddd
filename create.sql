drop schema if exists ccca cascade;

create schema ccca;

create table ccca.account (
	account_id uuid primary key,
	name text not null,
	email text not null,
	cpf text not null,
	car_plate text null,
	is_passenger boolean not null default false,
	is_driver boolean not null default false,
	password text not null
);

create table ccca.ride (
	ride_id uuid,
	passenger_id uuid,
	driver_id uuid,
	status text,
	fare numeric,
	distance numeric,
	from_lat numeric,
	from_long numeric,
	to_lat numeric,
	to_long numeric,
	date timestamp
);

create table ccca.position (
  position_id uuid,
  ride_id uuid,
  lat numeric,
  long numeric,
  date timestamp
);

create table ccca.ride_projection (
	ride_id uuid,
	passenger_name text,
	driver_name text,
	fare numeric,
	distance numeric,
	status text,
	payment_id uuid,
	payment_status text
);

create table ccca.events (
	event_id uuid primary key,
	name text,
	message text,
	date timestamp,
	published boolean,
	published_at timestamp
)