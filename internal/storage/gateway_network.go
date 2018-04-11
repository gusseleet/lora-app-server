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

// Validate gateway network name. 6-40 characters of any letters, numbers, dashes or underscores.
var gatewayNetworkNameRegexp = regexp.MustCompile(`^[[:word:]-]{6,40}$`)

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
	if !gatewayNetworkNameRegexp.MatchString(gn.Name) {
		return ErrGatewayNetworkInvalidName
	}
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

// GatewayNetworkUser represents a gateway network user
type GatewayNetworkUser struct {
	ID					int64					`db:"id"`
	UserID       		int64           		`db:"user_id"`
	Username			string					`db:"username"`
	CreatedAt       	time.Time             	`db:"created_at"`
	UpdatedAt       	time.Time             	`db:"updated_at"`
}

// CreateGatewayNetwork creates the given gateway network.
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

	err = DeleteAllGatewayNetworkUsersForGatewayNetworkID(db, id)
	if err != nil {
		return errors.Wrap(err, "delete all gateway network users error")
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

// DeleteGatewayNetworkGateway deletes the gateway network gateway matching the given ID and MAC.
func DeleteGatewayNetworkGateway(db sqlx.Ext, gnID int64, MAC lorawan.EUI64) error {
	res, err := db.Exec("delete from gateway_network_gateway where gateway_network_id = $1 and gateway_mac = $2", gnID, MAC[:])
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
		"id": gnID,
	}).Info("gateway network gateway deleted")

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

// DeleteAllGatewayNetworkGatewaysForGatewayNetworkID deletes all gateway network- gateway links
// given a gateway network id.
func DeleteAllGatewayNetworkGatewaysForGatewayNetworkID(db sqlx.Ext, gatewayNetworkID int64) error {
	var gngs []GatewayNetworkGateway
	gngs, err := GetGatewayNetworkGateways(db, gatewayNetworkID, 0, 0 )
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, gng := range gngs {
		err = DeleteGatewayNetworkGateway(db, gatewayNetworkID, gng.GatewayMAC)
		if err != nil {
			return errors.Wrap(err, "delete gateway network gateway error")
		}
	}

	return nil
}

// CreateGatewayNetworkUser adds the given user to the gatewayNetwork.
func CreateGatewayNetworkUser(db sqlx.Execer, gatewayNetworkID int64, userID int64) error {
	_, err := db.Exec(`
		insert into gateway_network_user (	
			gateway_network_id,
			user_id,
			created_at,
			updated_at
		) values ($1, $2, now(), now())`,
		gatewayNetworkID,
		userID,
	)
	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"user_id":         	userID,
		"gateway_network_id": 	gatewayNetworkID,
	}).Info("user added to gateway network")
	return nil
}

// DeleteGatewayNetworkUser deletes the gateway network user matching the given gateway network ID and user ID.
func DeleteGatewayNetworkUser(db sqlx.Ext, gnID int64, uID int64) error {
	res, err := db.Exec("delete from gateway_network_user where gateway_network_id = $1 and user_id = $2", gnID, uID)
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
		"id": gnID,
	}).Info("gateway network user deleted")

	return nil
}

// GetGatewayNetworkUser gets the information of the given gateway network-user.
func GetGatewayNetworkUser(db sqlx.Queryer, gatewayNetworkID int64, userID int64) (GatewayNetworkUser, error) {
	var u GatewayNetworkUser
	err := sqlx.Get(db, &u, `
		select
			u.id as user_id,
			u.username as username,
			gnu.created_at as created_at,
			gnu.updated_at as updated_at
		from gateway_network_user gnu
		inner join "user" u
			on u.id = gnu.user_id
		where
			gnu.gateway_network_id = $1
			and gnu.user_id = $2`,
		gatewayNetworkID,
		userID,
	)
	if err != nil {
		return u, handlePSQLError(Select, err, "select error")
	}
	return u, nil
}

// GetGatewayNetworkUserCount returns the number of users for the given gateway network.
func GetGatewayNetworkUserCount(db sqlx.Queryer, gatewayNetworkID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select count(*)
		from gateway_network_user
		where
			gateway_network_id = $1`,
		gatewayNetworkID,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworkCountForUser returns the number of gateway networks to which
// the given user is member of.
func GetGatewayNetworkCountForUser(db sqlx.Queryer, username string, search string) (int, error) {
	var count int

	if search != "" {
		search = "%" + search + "%"
	}

	err := sqlx.Get(db, &count, `
		select
			count(gn.*)
		from gateway_network gn
		inner join gateway_network_user gnu
			on gnu.gateway_network_id = gn.id
		inner join "user" u
			on u.id = gnu.user_id
		where
			u.username = $1
			and (
				($2 != '' and gn.name ilike $2)
				or ($2 = '')
			)`,
		username,
		search,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworksForUser returns a slice of gateway networks to which the given
// user is member of.
func GetGatewayNetworksForUser(db sqlx.Queryer, username string, limit, offset int, search string) ([]GatewayNetwork, error) {
	var gns []GatewayNetwork

	if search != "" {
		search = "%" + search + "%"
	}

	err := sqlx.Select(db, &gns, `
		select
			gn.*
		from gateway_network gn
		inner join gateway_network_user gnu
			on gnu.gateway_network_id = gn.id
		inner join "user" u
			on u.id = gnu.user_id
		where
			u.username = $1
			and (
				($4 != '' and gn.name ilike $4)
				or ($4 = '')
			)
		order by gn.name
		limit $2 offset $3`,
		username,
		limit,
		offset,
		search,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return gns, nil
}

// GetGatewayNetworkUsers returns the users for the given gateway network.
func GetGatewayNetworkUsers(db sqlx.Queryer, gatewayNetworkID int64, limit, offset int) ([]GatewayNetworkUser, error) {
	var users []GatewayNetworkUser
	err := sqlx.Select(db, &users, `
		select
			u.id as user_id,
			u.username as username,
			gnu.created_at as created_at,
			gnu.updated_at as updated_at
		from gateway_network_user gnu
		inner join "user" u
			on u.id = gnu.user_id
		where
			gnu.gateway_network_id = $1
		order by u.username
		limit $2 offset $3`,
		gatewayNetworkID,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return users, nil
}

// DeleteAllGatewayNetworkUsersForGatewayNetworkID deletes all gateway network- user links
// given a gateway network id.
func DeleteAllGatewayNetworkUsersForGatewayNetworkID(db sqlx.Ext, gatewayNetworkID int64) error {
	var gnus []GatewayNetworkUser
	gnus, err := GetGatewayNetworkUsers(db, gatewayNetworkID, 0, 0 )
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, gnu := range gnus {
		err = DeleteGatewayNetworkUser(db, gatewayNetworkID, gnu.UserID)
		if err != nil {
			return errors.Wrap(err, "delete gateway network user error")
		}
	}

	return nil
}