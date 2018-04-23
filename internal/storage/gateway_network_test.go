package storage

import (
	"testing"
	"time"

	"github.com/pkg/errors"
	"github.com/gusseleet/lora-app-server/internal/test"
	. "github.com/smartystreets/goconvey/convey"
	"github.com/brocaar/lorawan"
	"github.com/lib/pq"
	"github.com/gusseleet/lora-app-server/internal/config"
)

func TestGatewayNetwork(t *testing.T) {
	conf := test.GetConfig()

	Convey("Given a clean database with a network-server and organization", t, func() {
		db, err := OpenDatabase(conf.PostgresDSN)
		So(err, ShouldBeNil)
		test.MustResetDB(db)

		org := Organization{
			Name: "test-org",
		}
		So(CreateOrganization(db, &org), ShouldBeNil)

		nsClient := test.NewNetworkServerClient()
		config.C.NetworkServer.Pool = test.NewNetworkServerPool(nsClient)

		n := NetworkServer{
			Name:   "test-ns",
			Server: "test-ns:1234",
		}
		So(CreateNetworkServer(db, &n), ShouldBeNil)

		Convey("When creating a gateway network with an invalid space in the name", func() {
			gn := GatewayNetwork{
				Name:           "test Network",
				Description:    "A test network with an invalid name",
				PrivateNetwork: true,
				OrganizationID: org.ID,
			}
			err := CreateGatewayNetwork(db, &gn)

			Convey("Then an error is returned", func() {
				So(err, ShouldNotBeNil)
				So(errors.Cause(err), ShouldResemble, ErrGatewayNetworkInvalidName)
			})
		})

		Convey("When creating a gateway network with a too short name", func() {
			gn := GatewayNetwork{
				Name:           "test",
				Description:    "A test network with an invalid name",
				PrivateNetwork: true,
				OrganizationID: org.ID,
			}
			err := CreateGatewayNetwork(db, &gn)

			Convey("Then an error is returned", func() {
				So(err, ShouldNotBeNil)
				So(errors.Cause(err), ShouldResemble, ErrGatewayNetworkInvalidName)
			})
		})

		Convey("When creating a gateway network", func() {
			gn := GatewayNetwork{
				Name:           "testNetwork",
				Description:    "A test network",
				PrivateNetwork: true,
				OrganizationID: org.ID,
			}
			So(CreateGatewayNetwork(db, &gn), ShouldBeNil)
			gn.CreatedAt = gn.CreatedAt.Truncate(time.Millisecond).UTC()
			gn.UpdatedAt = gn.UpdatedAt.Truncate(time.Millisecond).UTC()

			Convey("Then it can be retrieved by its id", func() {
				g, err := GetGatewayNetwork(db, gn.ID)
				So(err, ShouldBeNil)
				g.CreatedAt = g.CreatedAt.Truncate(time.Millisecond).UTC()
				g.UpdatedAt = g.UpdatedAt.Truncate(time.Millisecond).UTC()
				So(g, ShouldResemble, gn)
			})

			Convey("Then the organization that created it can retrieve it", func() {
				gns, err := GetGatewayNetworksForOrganizationID(db, gn.OrganizationID, 10, 0)
				So(err, ShouldBeNil)
				gns[0].CreatedAt = gn.CreatedAt.Truncate(time.Millisecond).UTC()
				gns[0].UpdatedAt = gn.UpdatedAt.Truncate(time.Millisecond).UTC()
				So(gns[0], ShouldResemble, gn)
			})

			Convey("When updating the gateway network", func() {
				gn.Name = "test-gateway-network-updated"
				gn.Description = "An updated test network"
				gn.PrivateNetwork = false
				So(UpdateGatewayNetwork(db, &gn), ShouldBeNil)
				gn.CreatedAt = gn.CreatedAt.Truncate(time.Millisecond).UTC()
				gn.UpdatedAt = gn.UpdatedAt.Truncate(time.Millisecond).UTC()

				Convey("Then it has been updated", func() {
					g, err := GetGatewayNetwork(db, gn.ID)
					So(err, ShouldBeNil)
					g.CreatedAt = g.CreatedAt.Truncate(time.Millisecond).UTC()
					g.UpdatedAt = g.UpdatedAt.Truncate(time.Millisecond).UTC()
					So(g, ShouldResemble, gn)
				})
			})

			Convey("Then get gateway network count returns 1", func() {
				count, err := GetGatewayNetworkCount(db, 2)
				So(err, ShouldBeNil)
				So(count, ShouldEqual, 1)
			})

			Convey("Then get gateway networks returns the expected items", func() {
				items, err := GetGatewayNetworks(db, 2,10, 0)
				So(err, ShouldBeNil)
				So(items, ShouldHaveLength, 1)
				items[0].CreatedAt = items[0].CreatedAt.Truncate(time.Millisecond).UTC()
				items[0].UpdatedAt = items[0].UpdatedAt.Truncate(time.Millisecond).UTC()
				So(items[0], ShouldResemble, gn)
			})

			Convey("When creating a gateway", func() {
				gw := Gateway{
					MAC:             lorawan.EUI64{1, 2, 3, 4, 5, 6, 7, 8},
					Name:            "test-gw",
					Description:     "test gateway",
					OrganizationID:  org.ID,
					Ping:            true,
					NetworkServerID: n.ID,
					Tags:			 pq.StringArray{"Test","Test2"},
					MaxNodes:        64,
				}
				So(CreateGateway(db, &gw), ShouldBeNil)
				gw.CreatedAt = gw.CreatedAt.Truncate(time.Millisecond).UTC()
				gw.UpdatedAt = gw.UpdatedAt.Truncate(time.Millisecond).UTC()

				Convey("Then it can be retrieved by its MAC", func() {
					gw2, err := GetGateway(db, gw.MAC, false)
					So(err, ShouldBeNil)
					gw2.CreatedAt = gw2.CreatedAt.Truncate(time.Millisecond).UTC()
					gw2.UpdatedAt = gw2.UpdatedAt.Truncate(time.Millisecond).UTC()
					So(gw2, ShouldResemble, gw)
				})

				Convey("When adding the gateway to the gateway network", func() {
					So(CreateGatewayNetworkGateway(db, gn.ID, gw.MAC), ShouldBeNil) // admin user

					Convey("Then it can be retrieved", func() {
						g, err := GetGatewayNetworkGateway(db, gn.ID, gw.MAC)
						So(err, ShouldBeNil)
						So(g.GatewayMAC, ShouldEqual, gw.MAC)
						So(g.Name, ShouldEqual, gw.Name)
						c, err := GetGatewayNetworkGatewayCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)
					})

					Convey("Then it is included in the gateway list for the gateway network", func() {
						gws, err := GetGatewayNetworkGateways(db, gn.ID, 10, 0)
						So(err, ShouldBeNil)
						So(gws, ShouldHaveLength, 1)
						So(gws[0].GatewayMAC, ShouldEqual, gw.MAC)
						So(gws[0].Name, ShouldEqual, gw.Name)
						c, err := GetGatewayNetworkGatewayCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)
					})

					Convey("Then it can be deleted", func() {
						So(DeleteGatewayNetworkGateway(db, gn.ID, gw.MAC), ShouldBeNil) // admin user
						c, err := GetGatewayNetworkGatewayCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 0)
					})
				})
			})

			Convey("Given an organization", func() {
				org := Organization{
					Name:				"testorg",
					DisplayName: 		"testorg",
					CanHaveGateways: 	true,
					OrgNr:				"50",
				}
				err := CreateOrganization(db, &org)
				So(err, ShouldBeNil)

				Convey("Then no gateway networks are linked to this organization", func() {
					c, err := GetGatewayNetworkCountForOrganization(db, org.ID, "")
					So(err, ShouldBeNil)
					So(c, ShouldEqual, 0)

					gns, err := GetGatewayNetworksForOrganization(db, org.ID, 10, 0, "")
					So(err, ShouldBeNil)
					So(gns, ShouldHaveLength, 0)
				})

				Convey("When the organization is linked to the gateway network", func() {
					So(CreateGatewayNetworkOrganization(db, gn.ID, org.ID), ShouldBeNil)

					Convey("Then it can be retrieved", func() {
						u, err := GetGatewayNetworkOrganization(db, gn.ID, org.ID)
						So(err, ShouldBeNil)
						So(u.OrganizationID, ShouldEqual, org.ID)
						So(u.DisplayName, ShouldEqual, org.DisplayName)
					})

					Convey("Then the gateway network has 2 organizations linked(With the owner organization)", func() {
						c, err := GetGatewayNetworkOrganizationCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)

						users, err := GetGatewayNetworkOrganizations(db, gn.ID, 10, 0)
						So(err, ShouldBeNil)
						So(users, ShouldHaveLength, 1)
					})

					Convey("Then the test gateway network is returned for the organization", func() {
						c, err := GetGatewayNetworkCountForOrganization(db, org.ID, "")
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)

						gns, err := GetGatewayNetworksForOrganization(db, org.ID, 10, 0, "")
						So(err, ShouldBeNil)
						So(gns, ShouldHaveLength, 1)
						So(gns[0].ID, ShouldEqual, gn.ID)
					})

					Convey("Then searching the organization gateway networks shows 1 gateway network", func(){

					})
					//GetGatewayNetworkOrganizationGatewayNetworkCount

					Convey("Then searching the organization gateway networks returns the gateway network's name and id", func(){

					})
					//GetGatewayNetworkOrganizationGatewayNetworks

					Convey("Then it can be deleted", func() {
						So(DeleteGatewayNetworkOrganization(db, gn.ID, org.ID), ShouldBeNil) // admin user
						c, err := GetGatewayNetworkOrganizationCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 0)
					})
				})
			})
		})

	})
}