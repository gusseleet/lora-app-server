package storage

import (
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/brocaar/lorawan"

	"github.com/lib/pq"
	"regexp"
)

var gatewayNetworkNameRegexp = regexp.MustCompile(`^[\w-]+$`)

// GatewayNetwork defines the gateway-network.
type GatewayNetwork struct {
	ID           	int64     			  `db:"id"`
	CreatedAt       time.Time             `db:"created_at"`
	UpdatedAt       time.Time             `db:"updated_at"`
	Name   			string 				  `db:"name"`
	Tags			pq.StringArray		  `db:"tags"`
	Price           int64                 `db:"price"`
	PrivateNetwork 	bool				  `db:"private_network"`
	OrganizationID	int64				  `db:"organization_id"`
}

// Validate validates the gateway network data.
func (gn GatewayNetwork) Validate() error {
	return nil
}

// GatewayNetworkGateway represents a gateway network gateway
type GatewayNetworkGateway struct {
	ID					int64					`db:"id"`
	GatewayMAC       	lorawan.EUI64           `db:"gateway_mac"`
	Name				string					`db:"name"`
	CreatedAt       	time.Time             	`db:"created_at"`
	UpdatedAt       	time.Time             	`db:"updated_at"`
}

// CreateDeviceProfile creates the given device-profile.
func CreateGatewayNetwork(db sqlx.Queryer, gn *GatewayNetwork) error {
	if err := gn.Validate(); err != nil {
		return errors.Wrap(err, "validate error")
	}

	now := time.Now()

	err := sqlx.Get(db, &gn.ID, `
        insert into gateway_network (
            created_at,
            updated_at,
			name,
			tags,
			price,
			private_network,
			organization_id
        ) values ($1, $2, $3, $4, $5, $6, $7) returning id`,
		now,
		now,
		gn.Name,
		gn.Tags,
		gn.Price,
		gn.PrivateNetwork,
		gn.OrganizationID,
	)
	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}
	gn.CreatedAt = now
	gn.UpdatedAt = now
	log.WithFields(log.Fields{
		"id":   gn.ID,
		"name": gn.Name,
	}).Info("gateway_network created")
	return nil
}

// GetGatewayNetwork returns the gateway network matching the given id.
func GetGatewayNetwork(db sqlx.Queryer, id int64) (GatewayNetwork, error) {
	var gn GatewayNetwork
	err := sqlx.Get(db, &gn, "select * from gateway_network where id = $1", id)
	if err != nil{
		return gn, handlePSQLError(Select, err, "select error")
	}
	return gn, nil
}

// GetGatewayNetworkCount returns the total number of gateway networks.
func GetGatewayNetworkCount(db sqlx.Queryer, search string) (int, error) {
	var count int

	err := sqlx.Get(db, &count, "select count(*) from gateway_network")
	if err != nil {
		return 0, handlePSQLError(Select, err, "select error")
	}

	return count, nil
}

// GetGatewayNetworks returns a slice of gateway networks.
func GetGatewayNetworks(db sqlx.Queryer, limit, offset int) ([]GatewayNetwork, error) {
	var gns []GatewayNetwork
	err := sqlx.Select(db, &gns, `
		select *
		from gateway_network
		order by name
		limit $1 offset $2`,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return gns, nil
}

// UpdateGatewayNetwork updates the given gateway network.
func UpdateGatewayNetwork(db sqlx.Execer, gn *GatewayNetwork) error {
	if err := gn.Validate(); err != nil {
		return errors.Wrap(err, "validation error")
	}

	now := time.Now()
	res, err := db.Exec(`
		update gateway_network
		set
			name = $2,
			tags = $3,
			price = $4,
			private_network = $5,
			organization_id = $6,
			updated_at = $7
		where id = $1`,
		gn.ID,
		gn.Name,
		gn.Tags,
		gn.Price,
		gn.PrivateNetwork,
		gn.OrganizationID,
		now,
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

	gn.UpdatedAt = now
	log.WithFields(log.Fields{
		"name": gn.Name,
		"id":   gn.ID,
	}).Info("gateway_network updated")
	return nil
}

// DeleteGatewayNetwork deletes the gateway network matching the given id.
func DeleteGatewayNetwork(db sqlx.Ext, id int64) error {
	err := DeleteAllGatewayNetworkGatewaysForGatewayNetworkID(db, id)
	if err != nil {
		return errors.Wrap(err, "delete all gateway network gateways error")
	}

	res, err := db.Exec("delete from gateway_network where id = $1", id)
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

	log.WithField("id", id).Info("gateway_network deleted")
	return nil
}

// CreateGatewayNetworkGateway adds the given gateway to the gatewayNetwork.
func CreateGatewayNetworkGateway(db sqlx.Execer, gatewayNetworkID int64, gatewayMAC lorawan.EUI64) error {
	_, err := db.Exec(`
		insert into gateway_network_gateway (	
			gateway_network_id,
			gateway_mac,
			created_at,
			updated_at
		) values ($1, $2, now(), now())`,
		gatewayNetworkID,
		gatewayMAC[:],
	)
	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"gateway_MAC":         	gatewayMAC,
		"gateway_network_id": 	gatewayNetworkID,
	}).Info("gateway added to gateway network")
	return nil
}

// GetGatewayNetworkGateway gets the information of the given gateway network-gateway.
func GetGatewayNetworkGateway(db sqlx.Queryer, gatewayNetworkID int64, gatewayMAC lorawan.EUI64) (GatewayNetworkGateway, error) {
	var g GatewayNetworkGateway
	err := sqlx.Get(db, &g, `
		select
			g.mac as gateway_mac,
			g.name as name,
			gng.created_at as created_at,
			gng.updated_at as updated_at
		from gateway_network_gateway gng
		inner join "gateway" g
			on g.mac = gng.gateway_mac
		where
			gng.gateway_network_id = $1
			and gng.gateway_mac = $2`,
		gatewayNetworkID,
		gatewayMAC[:],
	)
	if err != nil {
		return g, handlePSQLError(Select, err, "select error")
	}
	return g, nil
}

// GetGatewayNetworkGatewayCount returns the number of gateways for the given gateway network.
func GetGatewayNetworkGatewayCount(db sqlx.Queryer, gatewayNetworkID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select count(*)
		from gateway_network_gateway
		where
			gateway_network_id = $1`,
		gatewayNetworkID,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworkGateways returns the gateways for the given gateway network.
func GetGatewayNetworkGateways(db sqlx.Queryer, gatewayNetworkID int64, limit, offset int) ([]GatewayNetworkGateway, error) {
	var gateways []GatewayNetworkGateway
	err := sqlx.Select(db, &gateways, `
		select
			g.mac as gateway_mac,
			g.name as name,
			gng.created_at as created_at,
			gng.updated_at as updated_at
		from gateway_network_gateway gng
		inner join "gateway" g
			on g.mac = gng.gateway_mac
		where
			gng.gateway_network_id = $1
		order by g.name
		limit $2 offset $3`,
		gatewayNetworkID,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return gateways, nil
}

// DeleteGatewayNetworkGateway deletes the gateway network gateway matching the given ID.
func DeleteGatewayNetworkGateway(db sqlx.Ext, id int64) error {
	res, err := db.Exec("delete from gateway_network_gateway where id = $1", id)
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
		"id": id,
	}).Info("gateway network gateway deleted")

	return nil
}

// DeleteAllGatewayNetworkGatewaysForGatewayNetworkID deletes all gateway network- gateway links
// given a gateway network id.
func DeleteAllGatewayNetworkGatewaysForGatewayNetworkID(db sqlx.Ext, gatewayNetworkID int64) error {
	var gngs []GatewayNetworkGateway
	gngs, err := GetGatewayNetworkGateways(db, gatewayNetworkID, 0, 0 )
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, gng := range gngs {
		err = DeleteGatewayNetworkGateway(db, gng.ID)
		if err != nil {
			return errors.Wrap(err, "delete gateway network gateway error")
		}
	}

	return nil
}