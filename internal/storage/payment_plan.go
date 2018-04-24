package storage

import (
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"regexp"
	"time"
	"fmt"
)

// Validate gateway network name. 6-40 characters of any letters, numbers, dashes or underscores.
var paymentPlanNameRegexp = regexp.MustCompile(`^[[:word:]-]{6,40}$`)

// PaymentPlan defines the payment plan.
type PaymentPlan struct {
	ID 				int64	`db:"id"`
	Name 			string 	`db:"name"`
	DataLimit		int32	`db:"data_limit"`
	AllowedDevices	int32	`db:"nr_of_allowed_devices"`
	AllowedApps 	int32	`db:"nr_of_allowed_apps"`
	FixedPrice 		int32 	`db:"fixed_price"`
	AddedDataPrice 	int32	`db:"added_data_price"`
}

type PaymentPlanGatewayNetwork struct {
	GatewayNetworkID	int64 		`db:"gw_id"`
	PaymentPlanID		int64 		`db:"pay_plan_id"`
	CreatedAt 			time.Time	`db:"created_at"`
	UpdatedAt  			time.Time	`db:"updated_at"`
	Name  				string		`db:"name"`
	Desc 				string 		`db:"description"`
	PrivateNetwork		bool 		`db:"private_network"`
	OrganizationID 		int64 		`db:"organization_id"`
}

// Validate validates the payment plan.
func (pp PaymentPlan) Validate() error {
	if !paymentPlanNameRegexp.MatchString(pp.Name) {
		return ErrPaymentPlanInvalidName
	}
	return nil
}

func CreatePaymentPlan(db sqlx.Queryer, pp *PaymentPlan) error {
	if err := pp.Validate(); err != nil {
		return errors.Wrap(err, "validate error")
	}

	err := sqlx.Get(db, &pp.ID, `
		insert into payment_plan (
			name,
			data_limit,
			nr_of_allowed_devices,
			nr_of_allowed_apps,
			fixed_price,
			added_data_price
		) values ($1, $2, $3, $4, $5, $6) returning id`,
		pp.Name,
		pp.DataLimit,
		pp.AllowedDevices,
		pp.AllowedApps,
		pp.FixedPrice,
		pp.AddedDataPrice,
	)

	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"id":	pp.ID,
		"name": pp.Name,
	}).Info("payment_plan created")

	return nil
}

func GetPaymentPlan(db sqlx.Queryer, id int64) (PaymentPlan, error) {
	var pp PaymentPlan
	fmt.Println("Payment Plan Get")
	err := sqlx.Get(db, &pp, "select * from payment_plan where id = $1", id)
	if err != nil {
		return pp, handlePSQLError(Select, err, "select error")
	}
	return pp, nil
}

func GetPaymentPlanCount(db sqlx.Queryer, search string) (int, error) {
	var count int

	if search != "" {
		search = search + "%"
	}

	err := sqlx.Get(db, &count, `
		select
			count(*)
		from payment_plan
		where
			($1 != '' and name like $1)
			or ($1 = '')`,
		search,
	)

	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

func GetPaymentPlans(db sqlx.Queryer, limit, offset int, search string) ([]PaymentPlan, error) {
	var pps []PaymentPlan

	if search != "" {
		search = "%" + search + "%"
	}

	err := sqlx.Select(db, &pps, `
		select
			*
		from payment_plan
		where
			($3 != '' and name like $3)
			or ($3 = '')
		order by name
		limit $1 offset $2`, limit, offset, search)

	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}

	return pps, nil
}

func UpdatePaymentPlan(db sqlx.Execer, pp *PaymentPlan) error {
	if err := pp.Validate(); err != nil {
		return errors.Wrap(err, "validation error")
	}

	res, err := db.Exec(`
		update payment_plan
		set
			name = $2,
			data_limit = $3,
			nr_of_allowed_devices = $4,
			nr_of_allowed_apps = $5,
			fixed_price = $6,
			added_data_price = $7
		where id = $1`,
		pp.ID,
		pp.Name,
		pp.DataLimit,
		pp.AllowedDevices,
		pp.AllowedApps,
		pp.FixedPrice,
		pp.AddedDataPrice,
	)

	if err != nil {
		return handlePSQLError(Update, err, "update error")
	}
	ra, err := res.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "get rows affected error")
	}
	if ra == 0 {
		return ErrDoesNotExist
	}

	log.WithFields(log.Fields {
		"name": pp.Name,
		"id":	pp.ID,
	}).Info("payment_plan updated")
	return nil
}

func DeletePaymentPlan(db sqlx.Ext, id int64) error {
	err := DeleteAllPaymentPlanToGatewayNetworkForGatewayNetworkID(db, id)
	if err != nil {
		return errors.Wrap(err, "delete all payment plan-to-gateway network error")
	}

	err = DeleteAllPaymentPlanToGatewayNetworkForGatewayNetworkID(db, id)
	if err != nil {
		return errors.Wrap(err, "delete all payment plan gateway networks error")
	}

	res, err := db.Exec("delete from payment_plan where id = $1", id)
	if err != nil {
		return handlePSQLError(Delete, err, "delete error")
	}
	ra, err := res.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "get rows affected error")
	}
	if ra == 0 {
		return ErrDoesNotExist
	}

	log.WithField("id", id).Info("payment_plan deleted")
	return nil
}

func DeleteAllPaymentPlanToGatewayNetworkForGatewayNetworkID(db sqlx.Ext, paymentPlanID int64) error {
	var ppgns []PaymentPlanGatewayNetwork

	ppgns, err := GetPaymentPlanToGatewayNetworks(db, paymentPlanID, 0, 0)
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, ppgn := range ppgns {
		err = DeletePaymentPlanToGatewayNetwork(db, paymentPlanID, ppgn.GatewayNetworkID)
		if err != nil {
			return errors.Wrap(err, "delete payment plan to gateway network error")
		}
	}

	return nil
}

func GetPaymentPlanToGatewayNetworks(db sqlx.Queryer, paymentPlanID int64, limit, offset int) ([]PaymentPlanGatewayNetwork, error) {
	var ppgns []PaymentPlanGatewayNetwork
	err := sqlx.Select(db, &ppgns, `
		select
			gn.id as gw_id,
			gn.created_at as created_at,
			gn.updated_at as updated_at,
			gn.name as name,
			gn.description as desc,
			gn.private_network as private_network,
			gn.organization_id as organization_id
		from gateway_network_to_payment_plan gnpp
		inner join "gateway_network" gn
			on gn.id = gnpp.gw_id
		where
			gnpp.pay_plan_id = $1
		order by gn.name
		limit $2 offset $3`,
		paymentPlanID,
		limit,
		offset,
	)

	if err != nil {
		return nil, handlePSQLError(Select, err, "selection error")
	}
	return ppgns, nil
}

func GetPaymentPlanToGatewayNetwork(db sqlx.Queryer, paymentPlanID int64, gatewayNetworkID int64) (PaymentPlanGatewayNetwork, error) {
	var gn PaymentPlanGatewayNetwork
	err := sqlx.Get(db, &gn, `
		select
			gn.id as gw_id,
			gn.created_at as created_at,
			gn.updated_at as updated_at,
			gn.name as name,
			gn.description as desc,
			gn.private_network as private_network,
			gn.organization_id as organization_id
		from gateway_network_to_payment_plan gnpp
		inner join "gateway_network" gn
			on gn.id = gnpp.gw_id
		where
			gnpp.pay_plan_id = $1
			and gnpp.gw_id = $2`,
		paymentPlanID,
		gatewayNetworkID,
	)

	if err != nil {
		return gn, handlePSQLError(Select, err, "select error")
	}
	return gn, nil
}

func GetPaymentPlanToGatewayNetworkCount(db sqlx.Queryer, paymentPlanID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select count(*)
		from gateway_network_to_payment_plan
		where
			pay_plan_id = $1`, paymentPlanID)

	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}

	return count, nil
}

func CreatePaymentPlanToGatewayNetwork(db sqlx.Execer, paymentPlanID int64, gatewayNetworkID int64) error {
	_, err := db.Exec(`
		insert into gateway_network_to_payment_plan (
			gw_id,
			pay_plan_id
		) values ($1, $2)`,
		gatewayNetworkID,
		paymentPlanID,
	)

	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"gateway_network_id": 	gatewayNetworkID,
		"payment_plan_id":		paymentPlanID,
	}).Info("gateway added to gateway network")
	return nil
}

func DeletePaymentPlanToGatewayNetwork(db sqlx.Ext, paymentPlanID int64, gatewayNetworkID int64) error {
	res, err := db.Exec("delete from gateway_network_to_payment_plan where pay_plan_id = $1 and gw_id = $2", paymentPlanID, gatewayNetworkID)
	if err != nil {
		return handlePSQLError(Delete, err, "delete error")
	}
	ra, err := res.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "get rows affected error")
	}
	if ra == 0 {
		return ErrDoesNotExist
	}

	log.WithFields(log.Fields{
		"id": paymentPlanID,
	}).Info("payment plan to gateway network deleted")

	return nil
}