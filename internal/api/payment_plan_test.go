package api

import (
	"testing"
	. "github.com/smartystreets/goconvey/convey"
	"golang.org/x/net/context"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"github.com/gusseleet/lora-app-server/internal/test"
	//"github.com/brocaar/loraserver/api/ns"
	//"github.com/brocaar/lorawan"

	//"github.com/pkg/errors"
)

func TestPaymentPlanAPI(t *testing.T) {
	conf := test.GetConfig()

	Convey("Given a clean database with an organization", t, func() {
		db, err := storage.OpenDatabase(conf.PostgresDSN)
		So(err, ShouldBeNil)
		config.C.PostgreSQL.DB = db
		test.MustResetDB(config.C.PostgreSQL.DB)

		ctx := context.Background()
		validator := &TestValidator{}
		api := NewPaymentPlanAPI(validator)
		gatewayNetworkAPI := NewGatewayNetworkAPI(validator)

		org := storage.Organization{
			Name: "test-organization",
		}
		So(storage.CreateOrganization(config.C.PostgreSQL.DB, &org), ShouldBeNil)

		Convey("When creating a payment plan with a valid name", func() {
			validator.returnIsAdmin = true
			createReq := &pb.CreatePaymentPlanRequest{
				Name:                "testPaymentPlan",
				DataLimit:           1000,
				AllowedDevices:      10,
				AllowedApplications: 10,
				FixedPrice:          1000,
				AddedDataPrice:      10,
			}
			createResp, err := api.Create(ctx, createReq)
			So(err, ShouldBeNil)
			So(validator.validatorFuncs, ShouldHaveLength, 1)
			So(createResp, ShouldNotBeNil)

			Convey("Then the payment plan has been created", func() {
				pp, err := api.Get(ctx, &pb.PaymentPlanRequest{
					Id: createResp.Id,
				})
				So(err, ShouldBeNil)
				So(pp.Name, ShouldEqual, createReq.Name)
				So(pp.DataLimit, ShouldEqual, createReq.DataLimit)
				So(pp.AllowedDevices, ShouldEqual, createReq.AllowedDevices)
				So(pp.AllowedApplications, ShouldEqual, createReq.AllowedApplications)
				So(pp.FixedPrice, ShouldEqual, createReq.FixedPrice)
				So(pp.AddedDataPrice, ShouldEqual, createReq.AddedDataPrice)

				Convey("When trying to list payment plans by searching a non-existing name", func() {
					pps, err := api.List(ctx, &pb.ListPaymentPlansRequest{
						Limit:  10,
						Offset: 0,
						Search: "willNotWork",
					})
					So(err, ShouldBeNil)
					So(pps.Result, ShouldHaveLength, 0)
					So(pps.TotalCount, ShouldEqual, 0)
				})

				Convey("When trying to list all payment plans", func() {
					pps, err := api.List(ctx, &pb.ListPaymentPlansRequest{
						Limit:  10,
						Offset: 0,
						Search: "",
					})
					So(err, ShouldBeNil)
					So(pps.Result, ShouldHaveLength, 1)
					So(pps.TotalCount, ShouldEqual, 1)
				})

				Convey("When updating the payment plan", func() {
					updatePP := &pb.UpdatePaymentPlanRequest{
						Id:                  createResp.Id,
						Name:                "newNameTest",
						DataLimit:           createReq.DataLimit,
						AllowedDevices:      createReq.AllowedDevices,
						AllowedApplications: createReq.AllowedApplications,
						FixedPrice:          createReq.FixedPrice,
						AddedDataPrice:      createReq.AddedDataPrice,
					}

					_, err := api.Update(ctx, updatePP)
					So(err, ShouldBeNil)
					So(validator.validatorFuncs, ShouldHaveLength, 1)

					Convey("Then the payment plan name has been updated", func() {
						ppUpd, err := api.Get(ctx, &pb.PaymentPlanRequest{
							Id: 1,
						})
						So(err, ShouldBeNil)
						So(validator.validatorFuncs, ShouldHaveLength, 1)
						So(ppUpd.Name, ShouldEqual, updatePP.Name)
					})
				})

				// Adding a Gateway Network
				Convey("When creating a Gateway Network", func() {
					validator.returnIsAdmin = true
					createGNReq := &pb.CreateGatewayNetworkRequest{
						Name:           "testGWNetwork",
						Description:    "A test network",
						PrivateNetwork: true,
						OrganizationID: org.ID,
					}
					createGNResp, err := gatewayNetworkAPI.Create(ctx, createGNReq)
					So(err, ShouldBeNil)
					So(validator.validatorFuncs, ShouldHaveLength, 1)
					So(createGNResp, ShouldNotBeNil)

					Convey("Then it is possible to connect the Gateway Network with the payment plan", func() {
						addPPGN := &pb.PayPlanGatewayNetworkRequest{
							Id:               createResp.Id,
							GatewayNetworkID: createGNResp.Id,
						}
						_, err := api.AddGatewayNetwork(ctx, addPPGN)
						So(err, ShouldBeNil)

						Convey("Then the Gateway network can be retrieved from the payment plan", func() {
							gwn, err := api.GetGatewayNetwork(ctx, &pb.PayPlanGatewayNetworkRequest{
								Id:               pp.Id,
								GatewayNetworkID: addPPGN.Id,
							})
							So(err, ShouldBeNil)
							So(gwn.Id, ShouldEqual, addPPGN.GatewayNetworkID)
							So(validator.validatorFuncs, ShouldHaveLength, 1)
						})

						Convey("When listing the gateway networks for the payment plan", func() {
							gwns, err := api.ListGatewayNetworks(ctx, &pb.ListPayPlanGatewayNetworksRequest{
								Id:     pp.Id,
								Limit:  10,
								Offset: 0,
							})
							So(err, ShouldBeNil)

							Convey("Then the nr of gateway networks should be 1", func() {
								So(gwns.TotalCount, ShouldEqual, 1)
								So(gwns.Result, ShouldHaveLength, 1)
							})
						})

						Convey("When removing the gateway network from the payment plan...", func() {
							delGWNPP := &pb.PayPlanGatewayNetworkRequest{
								Id:               addPPGN.Id,
								GatewayNetworkID: addPPGN.GatewayNetworkID,
							}
							_, err := api.DeleteGatewayNetwork(ctx, delGWNPP)
							So(err, ShouldBeNil)

							Convey("...Then the gateway network should have been removed", func() {
								ppgns, err := api.ListGatewayNetworks(ctx, &pb.ListPayPlanGatewayNetworksRequest{
									Id:     addPPGN.Id,
									Limit:  0,
									Offset: 0,
								})
								So(err, ShouldBeNil)
								So(ppgns, ShouldNotBeNil)
								So(ppgns.Result, ShouldHaveLength, 0)
								So(ppgns.TotalCount, ShouldEqual, 0)
							})
						})
					})
				})
			})
		})
	})
}