package storage

import (
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	"time"
)

type TransmittedData struct {
	ApplicationID	int64		`db:"application_id"`
	Data			int32		`db:"transmitted_data"`
	TransmittedAt	time.Time	`db:"transmitted_at"`
	TransmittedType	int32		`db:"transmitted_type"`
}

func GetTransmittedData(db sqlx.Queryer, limit, offset int32, applicationID int64, startDate string, endDate string, transmittedType int32) ([]TransmittedData, error) {
	var transmittedData []TransmittedData

	err := sqlx.Select(db, &transmittedData, `
		select
			* 
		from transmitted_data
		where (
			$3 = 0
			or application_id = $3
		) and (
			$4 = ''
			or transmitted_at >= cast($4 as timestamp with time zone)
		) and (
			$5 = ''
			or transmitted_at <= cast($5 as timestamp with time zone)
		) and (
			$6 = 0
			or transmitted_type = $6
		) order by transmitted_at limit $1 offset $2
		`, limit, offset, applicationID, startDate, endDate, transmittedType)
	if err != nil {
		return nil, errors.Wrap(err, "select error")
	}

	return transmittedData, nil
}

func GetTransmittedDataCount(db sqlx.Queryer, applicationID int64, startDate string, endDate string, transmittedType int32) (int32, error) {
	var count int32

	err := sqlx.Get(db, &count, `
		select
			count(*)
		from transmitted_data
		where (
			$1 = 0
			or application_id = $1
		) and (
			$2 = ''
			or transmitted_at >= cast($2 as timestamp with time zone)
		) and (
			$3 = ''
			or transmitted_at <= cast($3 as timestamp with time zone)
		) and (
			$4 = 0
			or transmitted_type = $4
		)
		`, applicationID, startDate, endDate, transmittedType)
	if err != nil {
		return 0, errors.Wrap(err, "select error")
	}
	return count, nil
}
