package storage

import (
	"testing"

	"github.com/pkg/errors"
	"github.com/gusseleet/lora-app-server/internal/test"
	. "github.com/smartystreets/goconvey/convey"
	"github.com/gusseleet/lora-app-server/internal/config"
)

func TestPaymentPlan(t *testing.T) {
	conf := test.GetConfig()

	Convey("Given a clean database with a network-server, organization and gateway network", t, func() {
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
			Name:	"test-ns",
			Server:	"test-ns:1234",
		}
		So(CreateNetworkServer(db, &n), ShouldBeNil)

		gn := GatewayNetwork{
			Name:           "testNetwork",
			Description:    "A Test Network",
			PrivateNetwork: false,
			OrganizationID: org.ID,
		}
		So(CreateGatewayNetwork(db, &gn), ShouldBeNil)

		Convey("When creating a payment plan with an invalid space in the name...", func() {
			pp := PaymentPlan{
				Name:           "Test Payment-plan",
				DataLimit:      10,
				AllowedDevices: 10,
				AllowedApps:    10,
				FixedPrice:     10,
				AddedDataPrice: 10,
				OrganizationID: org.ID,
			}

			err := CreatePaymentPlan(db, &pp)

			Convey("...Then an error is returned", func() {
				So(err, ShouldNotBeNil)
				So(errors.Cause(err), ShouldResemble, ErrPaymentPlanInvalidName)
			})
		})

		Convey("When creating a payment plan with a too short name...", func() {
			pp := PaymentPlan{
				Name:           "t",
				DataLimit:      10,
				AllowedDevices: 10,
				AllowedApps:    10,
				FixedPrice:     10,
				AddedDataPrice: 10,
				OrganizationID: org.ID,
			}

			err := CreatePaymentPlan(db, &pp)

			Convey("...Then an error is returned", func() {
				So(err, ShouldNotBeNil)
				So(errors.Cause(err), ShouldResemble, ErrPaymentPlanInvalidName)
			})
		})

		Convey("When creating a payment plan...", func() {
			pp := PaymentPlan{
				Name:           "test-payment-plan",
				DataLimit:      10,
				AllowedDevices: 10,
				AllowedApps:    10,
				FixedPrice:     10,
				AddedDataPrice: 10,
				OrganizationID: org.ID,
			}
			So(CreatePaymentPlan(db, &pp), ShouldBeNil)

			Convey("...Then it can be retrieved by its id", func() {
				p, err := GetPaymentPlan(db, pp.ID)
				So(err, ShouldBeNil)
				So(p, ShouldResemble, pp)
			})

			Convey("...Then it can be retrieved from a list", func() {
				pps, err := GetPaymentPlans(db, 10, 0, "", org.ID)
				So(err, ShouldBeNil)
				So(pps[0], ShouldResemble, pp)
			})

			Convey("...Then it can be retrieved by searching on its name", func() {
				pps, err := GetPaymentPlans(db, 10, 0, "test-payment-plan", org.ID)
				So(err, ShouldBeNil)
				So(pps[0], ShouldResemble, pp)
			})

			Convey("...Then the payment plan count should be 1", func() {
				count, err := GetPaymentPlanCount(db, "", org.ID)
				So(err, ShouldBeNil)
				So(count, ShouldEqual, 1)
			})

			Convey("...And when updating the payment plan...", func() {
				pp.Name = "updated-test-payment-plan"
				pp.FixedPrice = 1000
				So(UpdatePaymentPlan(db, &pp), ShouldBeNil)

				Convey("...It has been updated", func() {
					p, err := GetPaymentPlan(db, pp.ID)
					So(err, ShouldBeNil)
					So(p, ShouldResemble, pp)
				})
			})

			Convey("...It can be connected with the gateway network...", func() {
				So(CreatePaymentPlanToGatewayNetwork(db, pp.ID, gn.ID), ShouldBeNil)

				Convey("...And then be retrieved...", func() {
					g, err := GetPaymentPlanToGatewayNetwork(db, pp.ID, gn.ID)
					So(err, ShouldBeNil)
					So(g.PaymentPlanID, ShouldEqual, pp.ID)
					So(g.GatewayNetworkID, ShouldEqual, gn.ID)
					So(g.Name, ShouldEqual, gn.Name)
					So(g.PrivateNetwork, ShouldEqual, gn.PrivateNetwork)
					So(g.Desc, ShouldEqual, gn.Description)
					Convey("...And the count is 1", func() {
						c, err := GetPaymentPlanToGatewayNetworkCount(db, pp.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)
					})
				})

				Convey("...And be included in the list of connections...", func() {
					gns, err := GetPaymentPlanToGatewayNetworks(db, pp.ID, 10, 0)
					So(err, ShouldBeNil)
					So(gns, ShouldHaveLength, 1)
					So(gns[0].Name, ShouldEqual, gn.Name)
					So(gns[0].GatewayNetworkID, ShouldEqual, gn.ID)
					So(gns[0].OrganizationID, ShouldEqual, org.ID)

					Convey("...And the count is 1", func() {
						c, err := GetPaymentPlanToGatewayNetworkCount(db, pp.ID)
						So(err, ShouldBeNil)
						So(c, ShouldEqual, 1)
					})
				})

				Convey("...And be deleted...", func() {
					So(DeletePaymentPlanToGatewayNetwork(db, pp.ID, gn.ID), ShouldBeNil)
					c, err := GetPaymentPlanToGatewayNetworkCount(db, pp.ID)
					So(err, ShouldBeNil)
					So(c, ShouldEqual, 0)
				})
			})
		})
	})
}

