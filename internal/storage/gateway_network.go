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
	ID           		int64     			  	`db:"id"`
	CreatedAt       	time.Time             	`db:"created_at"`
	UpdatedAt       	time.Time             	`db:"updated_at"`
	GatewayMAC       	lorawan.EUI64           `db:"gateway_mac"`
	GatewayNetworkId	int64					`db:"gateway_network_id"`
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

// CreateGatewayNetworkGateway adds the given gateway to the gatewayNetwork.
func CreateGatewayNetworkGateway(db sqlx.Execer, gatewayNetworkID, gatewayMAC int64) error {
	_, err := db.Exec(`
		insert into gateway_network_gateway (	
			gateway_network_id,
			gateway_mac,
			created_at,
			updated_at
		) values ($1, $2, now(), now())`,
		gatewayNetworkID,
		gatewayMAC,
	)
	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"gateway_MAC":         	gatewayMAC,
		"gateway_network_id": 	gatewayNetworkID,
	}).Info("Gateway added to Gateway Network")
	return nil
}