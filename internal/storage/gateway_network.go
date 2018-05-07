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
	Description     string                `db:"description"`
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
	CreatedAt       	time.Time			    `db:"created_at"`
	UpdatedAt       	time.Time     			`db:"updated_at"`
	Name            	string        			`db:"name"`
	Description     	string        			`db:"description"`
	OrganizationID  	int64         			`db:"organization_id"`
	Ping            	bool          			`db:"ping"`
	LastPingID      	*int64        			`db:"last_ping_id"`
	LastPingSentAt  	*time.Time    			`db:"last_ping_sent_at"`
	NetworkServerID 	int64         			`db:"network_server_id"`
	Tags				pq.StringArray	  		`db:"tags"`
	MaxNodes			int64			  		`db:"maxnodes"`
}

// GatewayNetworkOrganization represents a gateway network organization
type GatewayNetworkOrganization struct {
	ID					int64					`db:"id"`
	OrganizationID      int64           		`db:"organization_id"`
	DisplayName			string					`db:"display_name"`
	CreatedAt       	time.Time             	`db:"created_at"`
	UpdatedAt       	time.Time             	`db:"updated_at"`
}

// GatewayNetworkOrganizationGatewayNetwork represents a gateway network organization, gateway
type GatewayNetworkOrganizationGatewayNetwork struct {
	ID					int64					`db:"id"`
	GatewayNetworkID    int64           		`db:"gateway_network_id"`
	Name				string					`db:"name"`
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
			description,
			private_network,
			organization_id
        ) values ($1, $2, $3, $4, $5, $6) returning id`,
		now,
		now,
		gn.Name,
		gn.Description,
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
func GetGatewayNetworkCount(db sqlx.Queryer, privateNetwork int64) (int, error) {
	var count int

	if privateNetwork == 0 {
		err := sqlx.Get(db, &count, "select count(*) from gateway_network")
		if err != nil {
			return 0, handlePSQLError(Select, err, "select error")
		}
	} else if privateNetwork == 1 || privateNetwork == 2 {
		pn := false

		if privateNetwork == 2 {
			pn = true
		}

		err := sqlx.Get(db, &count, "select count(*) from gateway_network where private_network = $1", pn)
		if err != nil {
			return 0, handlePSQLError(Select, err, "select error")
		}
	} else{
		return 0, handlePSQLError(Select, ErrGatewayNetworkInvalidPrivateNetwork, "select error")
	}

	return count, nil
}

// GetGatewayNetworkCountForOrganizationID returns the total number of gateway networks for the given organization id.
func GetGatewayNetworkCountForOrganizationID(db sqlx.Queryer, organizationID int64, privateNetwork int64) (int, error) {
	var count int

	if privateNetwork == 0 {
		err := sqlx.Get(db, &count, "select count(*) from gateway_network where organization_id = $1", organizationID)
		if err != nil {
			return 0, handlePSQLError(Select, err, "select error")
		}
	} else if privateNetwork == 1 || privateNetwork == 2 {
		pn := false;

		if privateNetwork == 2 {
			pn = true;
		}

		err := sqlx.Get(db, &count, "select count(*) from gateway_network where organization_id = $1 and private_network = $2", organizationID, pn)
		if err != nil {
			return 0, handlePSQLError(Select, err, "select error")
		}
	} else {
		return 0, handlePSQLError(Select, ErrGatewayNetworkInvalidPrivateNetwork, "select error")
	}

	return count, nil
}


// GetGatewayNetworks returns a slice of gateway networks.
func GetGatewayNetworks(db sqlx.Queryer, privateNetwork int64, limit, offset int) ([]GatewayNetwork, error) {
	if privateNetwork == 0{
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
	} else if privateNetwork == 1 || privateNetwork == 2{
		pn := false

		if privateNetwork == 2{
			pn = true
		}

		var gns []GatewayNetwork
		err := sqlx.Select(db, &gns, `
		select *
		from gateway_network
		where private_network = $1
		order by name
		limit $2 offset $3`,
			pn,
			limit,
			offset,
		)
		if err != nil {
			return nil, handlePSQLError(Select, err, "select error")
		}
		return gns, nil
	} else {
		return nil, handlePSQLError(Select, ErrGatewayNetworkInvalidPrivateNetwork, "select error")
	}
}

// GetGatewayNetworksForOrganizationID returns a slice of gateway networks for the give organization id.
func GetGatewayNetworksForOrganizationID(db sqlx.Queryer, organizationID int64, privateNetwork int64, limit, offset int) ([]GatewayNetwork, error) {
	var gns []GatewayNetwork

	if privateNetwork == 0 {

		err := sqlx.Select(db, &gns, `
		select *
		from gateway_network
		where organization_id = $1
		order by name
		limit $2 offset $3`,
			organizationID,
			limit,
			offset,
		)
		if err != nil {
			return nil, handlePSQLError(Select, err, "select error")
		}
		return gns, nil
	} else if privateNetwork == 1 || privateNetwork == 2 {
		pn := false;

		if privateNetwork == 2{
			pn = true;
		}

		err := sqlx.Select(db, &gns, `
		select *
		from gateway_network
		where organization_id = $1
		and private_network = $2
		order by name
		limit $3 offset $4`,
			organizationID,
			pn,
			limit,
			offset,
		)
		if err != nil {
			return nil, handlePSQLError(Select, err, "select error")
		}
		return gns, nil
	} else {
		return nil, handlePSQLError(Select, ErrGatewayNetworkInvalidPrivateNetwork, "select error")
	}
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
			description = $3,
			private_network = $4,
			organization_id = $5,
			updated_at = $6
		where id = $1`,
		gn.ID,
		gn.Name,
		gn.Description,
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

	err = DeleteAllGatewayNetworkOrganizationsForGatewayNetworkID(db, id)
	if err != nil {
		return errors.Wrap(err, "delete all gateway network organizations error")
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
			gng.updated_at as updated_at,
			g.tags,
			g.description,
			g.organization_id,
			g.maxnodes,
			g.network_server_id,
			g.ping
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
			gng.updated_at as updated_at,
			g.tags as tags
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

// GetGatewayNetworkGateways returns the gateways for the given gateway network and gateway mac.
func GetGatewayNetworkGatewaysForGatewayMAC(db sqlx.Queryer, gatewayMAC lorawan.EUI64, limit, offset int) ([]GatewayNetworkGateway, error) {
	var gateways []GatewayNetworkGateway
	err := sqlx.Select(db, &gateways, `
		select
			g.mac as gateway_mac,
			g.name as name,
			gng.created_at as created_at,
			gng.updated_at as updated_at,
			g.tags as tags
		from gateway_network_gateway gng
		inner join "gateway" g
			on g.mac = gng.gateway_mac
		where
			gng.gateway_mac = $1
		order by g.name
		limit $2 offset $3`,
		gatewayMAC,
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

// DeleteAllGatewayNetworkGatewaysForGatewayMAC deletes all gateway network- gateway links
// given a gateway MAC.
func DeleteAllGatewayNetworkGatewaysForGatewayMAC(db sqlx.Ext, gatewayMAC lorawan.EUI64) error {
	var gngs []GatewayNetworkGateway
	gngs, err := GetGatewayNetworkGatewaysForGatewayMAC(db, gatewayMAC, 0, 0 )
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, gng := range gngs {
		err = DeleteGatewayNetworkGateway(db, gng.ID, gatewayMAC)
		if err != nil {
			return errors.Wrap(err, "delete gateway network gateway error")
		}
	}

	return nil
}

// CreateGatewayNetworkOrganization adds the given organization to the gatewayNetwork.
func CreateGatewayNetworkOrganization(db sqlx.Execer, gatewayNetworkID int64, organizationID int64) error {
	_, err := db.Exec(`
		insert into gateway_network_organization (	
			gateway_network_id,
			organization_id,
			created_at,
			updated_at
		) values ($1, $2, now(), now())`,
		gatewayNetworkID,
		organizationID,
	)
	if err != nil {
		return handlePSQLError(Insert, err, "insert error")
	}

	log.WithFields(log.Fields{
		"organization_id":      organizationID,
		"gateway_network_id": 	gatewayNetworkID,
	}).Info("organization added to gateway network")
	return nil
}

// DeleteGatewayNetworkOrganization deletes the gateway network organization matching the given gateway network ID and organization ID.
func DeleteGatewayNetworkOrganization(db sqlx.Ext, gnID int64, oID int64) error {
	res, err := db.Exec("delete from gateway_network_organization where gateway_network_id = $1 and organization_id = $2", gnID, oID)
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
	}).Info("gateway network organization deleted")

	return nil
}

// GetGatewayNetworkOrganization gets the information of the given gateway network-organization.
func GetGatewayNetworkOrganization(db sqlx.Queryer, gatewayNetworkID int64, organizationID int64) (GatewayNetworkOrganization, error) {
	var o GatewayNetworkOrganization
	err := sqlx.Get(db, &o, `
		select
			o.id as organization_id,
			o.display_name as display_name,
			gno.created_at as created_at,
			gno.updated_at as updated_at
		from gateway_network_organization gno
		inner join organization o
			on o.id = gno.organization_id
		where
			gno.gateway_network_id = $1
			and gno.organization_id = $2`,
		gatewayNetworkID,
		organizationID,
	)
	if err != nil {
		return o, handlePSQLError(Select, err, "select error")
	}
	return o, nil
}


// GetGatewayNetworkOrganizationGatewayNetworkCount returns the number of gateway networks for the given organization.(REGISTERED)
func GetGatewayNetworkOrganizationGatewayNetworkCount(db sqlx.Queryer, organizationID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select count(*)
		from gateway_network_organization
		where
			organization_id = $1`,
		organizationID,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworkOrganizationCount returns the number of organizations for the given gateway network.
func GetGatewayNetworkOrganizationCount(db sqlx.Queryer, gatewayNetworkID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select count(*)
		from gateway_network_organization
		where
			gateway_network_id = $1`,
		gatewayNetworkID,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworkCountForOrganization returns the number of gateway networks to which
// the given organization is a member of.
func GetGatewayNetworkCountForOrganization(db sqlx.Queryer, organizationID int64, search string) (int, error) {
	var count int

	if search != "" {
		search = "%" + search + "%"
	}

	err := sqlx.Get(db, &count, `
		select
			count(gn.*)
		from gateway_network gn
		inner join gateway_network_organization gno
			on gno.gateway_network_id = gn.id
		inner join organization o
			on o.id = gno.organization_id
		where
			o.id = $1
			and (
				($2 != '' and gn.name ilike $2)
				or ($2 = '')
			)`,
		organizationID,
		search,
	)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}
	return count, nil
}

// GetGatewayNetworksForOrganization returns a slice of gateway networks to which the given
// organization is a member of.
func GetGatewayNetworksForOrganization(db sqlx.Queryer, organizationID int64, limit, offset int, search string) ([]GatewayNetwork, error) {
	var gns []GatewayNetwork

	if search != "" {
		search = "%" + search + "%"
	}

	err := sqlx.Select(db, &gns, `
		select
			gn.*
		from gateway_network gn
		inner join gateway_network_organization gno
			on gno.gateway_network_id = gn.id
		inner join organization o
			on o.id = gno.organization_id
		where
			o.id = $1
			and (
				($4 != '' and gn.name ilike $4)
				or ($4 = '')
			)
		order by gn.name
		limit $2 offset $3`,
		organizationID,
		limit,
		offset,
		search,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return gns, nil
}

// GetGatewayNetworkOrganizationGatewayNetworks returns the gateway networks for the given organization(REGISTERED).
func GetGatewayNetworkOrganizationGatewayNetworks(db sqlx.Queryer, organizationID int64, limit, offset int) ([]GatewayNetworkOrganizationGatewayNetwork, error) {
	var gns []GatewayNetworkOrganizationGatewayNetwork
	err := sqlx.Select(db, &gns, `
		select
			gn.id as gateway_network_id,
			gn.name as name,
			gno.created_at as created_at,
			gno.updated_at as updated_at
		from gateway_network_organization gno
		inner join gateway_network gn
			on gn.id = gno.gateway_network_id
		where
			gno.organization_id = $1
		order by gn.name
		limit $2 offset $3`,
		organizationID,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return gns, nil
}

// GetGatewayNetworkOrganizations returns the organizations for the given gateway network.
func GetGatewayNetworkOrganizations(db sqlx.Queryer, gatewayNetworkID int64, limit, offset int) ([]GatewayNetworkOrganization, error) {
	var organizations []GatewayNetworkOrganization
	err := sqlx.Select(db, &organizations, `
		select
			o.id as organization_id,
			o.display_name as display_name,
			gno.created_at as created_at,
			gno.updated_at as updated_at
		from gateway_network_organization gno
		inner join organization o
			on o.id = gno.organization_id
		where
			gno.gateway_network_id = $1
		order by o.display_name
		limit $2 offset $3`,
		gatewayNetworkID,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return organizations, nil
}

// DeleteAllGatewayNetworkOrganizationsForGatewayNetworkID deletes all gateway network- organization links
// given a gateway network id.
func DeleteAllGatewayNetworkOrganizationsForGatewayNetworkID(db sqlx.Ext, gatewayNetworkID int64) error {
	var gnos []GatewayNetworkOrganization
	gnos, err := GetGatewayNetworkOrganizations(db, gatewayNetworkID, 0, 0 )
	if err != nil {
		return handlePSQLError(Select, err, "select error")
	}

	for _, gno := range gnos {
		err = DeleteGatewayNetworkOrganization(db, gatewayNetworkID, gno.OrganizationID)
		if err != nil {
			return errors.Wrap(err, "delete gateway network organization error")
		}
	}

	return nil
}

func GetGatewayNetworkPaymentPlans(db sqlx.Ext, gatewayNetworkID int64, limit, offset int) ([]PaymentPlan, error) {
	var paymentPlans []PaymentPlan
	err := sqlx.Select(db, &paymentPlans, `
		select
			pp.id as id,
			pp.name as name,
			pp.data_limit as data_limit,
			pp.nr_of_allowed_devices as nr_of_allowed_devices,
			pp.nr_of_allowed_apps as nr_of_allowed_apps,
			pp.fixed_price as fixed_price,
			pp.added_data_price as added_data_price,
			pp.organization_id as organization_id
		from payment_plan pp
		inner join gateway_network_to_payment_plan gwnpp
			on gwnpp.pay_plan_id = pp.id
		where
			gwnpp.gw_id = $1
		order by pp.name
		limit $2 offset $3`,
		gatewayNetworkID,
		limit,
		offset,
	)
	if err != nil {
		return nil, handlePSQLError(Select, err, "select error")
	}
	return paymentPlans, nil
}

func GetGatewayNetworkPaymentPlanCount(db sqlx.Ext, gatewayNetworkID int64) (int, error) {
	var count int
	err := sqlx.Get(db, &count, `
		select
			count(*)
		from payment_plan pp
		inner join gateway_network_to_payment_plan gwnpp
			on gwnpp.pay_plan_id = pp.id
		where
			gwnpp.gw_id = $1`,
		gatewayNetworkID,)
	if err != nil {
		return count, handlePSQLError(Select, err, "select error")
	}

	return count, nil
}