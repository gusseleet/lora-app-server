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
				Tags:           pq.StringArray{"Test", "test"},
				Price:          200,
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
				Tags:           pq.StringArray{"Test", "test"},
				Price:          200,
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
				Tags:           pq.StringArray{"Test", "test"},
				Price:          200,
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

			Convey("When updating the gateway network", func() {
				gn.Name = "test-gateway-network-updated"
				gn.Tags = pq.StringArray{"Edited", "edited"}
				gn.Price = 500
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
				count, err := GetGatewayNetworkCount(db, "")
				So(err, ShouldBeNil)
				So(count, ShouldEqual, 1)
			})

			Convey("Then get gateway networks returns the expected items", func() {
				items, err := GetGatewayNetworks(db, 10, 0)
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

				Convey("Then it can be get by its MAC", func() {
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
					})

					Convey("Then it can be deleted", func() {
						So(DeleteGatewayNetworkGateway(db, gn.ID, gw.MAC), ShouldBeNil) // admin user
						c, err := GetGatewayNetworkGatewayCount(db, gn.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 0)
					})
				})


			})
		})

	})
}