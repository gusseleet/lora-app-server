package api

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"golang.org/x/net/context"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"github.com/gusseleet/lora-app-server/internal/test"
	"github.com/brocaar/loraserver/api/ns"
	"github.com/brocaar/lorawan"
	"time"
	"github.com/pkg/errors"
	"github.com/lib/pq"
)

func TestGatewayNetworkAPI(t *testing.T) {
	conf := test.GetConfig()

	Convey("Given a clean database with an organization and a payment plan", t, func() {
		db, err := storage.OpenDatabase(conf.PostgresDSN)
		So(err, ShouldBeNil)
		config.C.PostgreSQL.DB = db
		test.MustResetDB(config.C.PostgreSQL.DB)

		ctx := context.Background()
		validator := &TestValidator{}
		api := NewGatewayNetworkAPI(validator)
		gatewayAPI := NewGatewayAPI(validator)
		payPlanAPI := NewPaymentPlanAPI(validator)

		org := storage.Organization{
			Name: "test-organization",
		}
		So(storage.CreateOrganization(config.C.PostgreSQL.DB, &org), ShouldBeNil)

		pp := storage.PaymentPlan{
			Name:           "Test",
			DataLimit:      10,
			AllowedDevices: 10,
			AllowedApps:    10,
			FixedPrice:     10,
			AddedDataPrice: 10,
			OrganizationID: org.ID,
		}
		So(storage.CreatePaymentPlan(config.C.PostgreSQL.DB, &pp), ShouldBeNil)

		Convey("When creating a gateway network with a valid name", func() {
			validator.returnIsAdmin = true
			createReq := &pb.CreateGatewayNetworkRequest{
				Name:            "testNetwork",
				Description:     "A test network",
				PrivateNetwork:  true,
				OrganizationID:  org.ID,
			}
			createResp, err := api.Create(ctx, createReq)
			So(err, ShouldBeNil)
			So(validator.validatorFuncs, ShouldHaveLength, 1)
			So(createResp, ShouldNotBeNil)

			Convey("Then the gateway network has been created", func() {
				gn, err := api.Get(ctx, &pb.GatewayNetworkRequest{
					Id: createResp.Id,
				})
				So(err, ShouldBeNil)
				So(gn.Name, ShouldEqual, createReq.Name)
				So(gn.Description, ShouldEqual, createReq.Description)
				So(gn.PrivateNetwork, ShouldEqual, createReq.PrivateNetwork)
				So(gn.OrganizationID, ShouldEqual, createReq.OrganizationID)
				gnId := int64(1)

				Convey("When trying to list only public gateway networks 0 should be returned", func() {
					gns, err := api.List(ctx, &pb.ListGatewayNetworksRequest{
						PrivateNetwork: 1,
						Limit:          10,
						Offset:         0,
					})
					So(err, ShouldBeNil)
					So(gns.Result, ShouldHaveLength, 0)
					So(gns.TotalCount, ShouldEqual, 0)
				})

				Convey("When trying to list the gateway network", func() {
					gns, err := api.List(ctx, &pb.ListGatewayNetworksRequest{
						PrivateNetwork: 2,
						Limit:          10,
						Offset:         0,
					})
					So(err, ShouldBeNil)
					So(gns.Result, ShouldHaveLength, 1)
					So(gns.TotalCount, ShouldEqual, 1)
				})

				Convey("When updating the gateway network", func() {
					updateGN := &pb.UpdateGatewayNetworkRequest{
						Id:              gnId,
						Name:            "anotherNetwork",
						Description:     "An updated network",
						PrivateNetwork:  false,
						OrganizationID:  gn.OrganizationID,
					}
					_, err := api.Update(ctx, updateGN)
					So(err, ShouldBeNil)
					So(validator.validatorFuncs, ShouldHaveLength, 1)

					Convey("Then the organization has been updated", func() {
						gnUpd, err := api.Get(ctx, &pb.GatewayNetworkRequest{
							Id: gnId,
						})
						So(err, ShouldBeNil)
						So(validator.validatorFuncs, ShouldHaveLength, 1)
						So(gnUpd.Name, ShouldResemble, updateGN.Name)
						So(gnUpd.Description, ShouldResemble, updateGN.Description)
						So(gnUpd.PrivateNetwork, ShouldResemble, updateGN.PrivateNetwork)
						So(gnUpd.OrganizationID, ShouldResemble, updateGN.OrganizationID)
					})
				})

				// Adding a new gateway to add to the network
				nsClient := test.NewNetworkServerClient()
				config.C.NetworkServer.Pool = test.NewNetworkServerPool(nsClient)

				n := storage.NetworkServer{
					Name:   "test-ns",
					Server: "test-ns:1234",
				}
				So(storage.CreateNetworkServer(config.C.PostgreSQL.DB, &n), ShouldBeNil)

				now := time.Now().UTC()
				getGatewayResponseNS := ns.GetGatewayResponse{
					Mac:         []byte{1, 2, 3, 4, 5, 6, 7, 8},
					Name:        "test-gateway",
					Description: "test gateway",
					Latitude:    1.1234,
					Longitude:   1.1235,
					Altitude:    5.5,
					CreatedAt:   now.UTC().Format(time.RFC3339Nano),
					UpdatedAt:   now.UTC().Add(1 * time.Second).Format(time.RFC3339Nano),
					FirstSeenAt: now.UTC().Add(2 * time.Second).Format(time.RFC3339Nano),
					LastSeenAt:  now.UTC().Add(3 * time.Second).Format(time.RFC3339Nano),
				}

				getGatewayResponseAS := pb.GetGatewayResponse{
					Mac:             "0102030405060708",
					Name:            "test-gateway",
					Description:     "test gateway",
					Latitude:        1.1234,
					Longitude:       1.1235,
					Altitude:        5.5,
					FirstSeenAt:     now.UTC().Add(2 * time.Second).Format(time.RFC3339Nano),
					LastSeenAt:      now.UTC().Add(3 * time.Second).Format(time.RFC3339Nano),
					OrganizationID:  org.ID,
					Ping:            true,
					NetworkServerID: n.ID,
					Tags : []string{"Test","Tag"},
					MaxNodes: 3,
				}

				Convey("When calling create for a gateway for testing", func() {
					_, err := gatewayAPI.Create(ctx, &pb.CreateGatewayRequest{
						Mac:             "0102030405060708",
						Name:            "test-gateway",
						Description:     "test gateway",
						Latitude:        1.1234,
						Longitude:       1.1235,
						Altitude:        5.5,
						OrganizationID:  org.ID,
						Ping:            true,
						NetworkServerID: n.ID,
						Tags:            []string{"Test", "Tag"},
						MaxNodes:        3,
					})
					So(err, ShouldBeNil)
					So(validator.ctx, ShouldResemble, ctx)
					So(validator.validatorFuncs, ShouldHaveLength, 1)

					Convey("Then the correct request was forwarded to the network-server api", func() {
						So(nsClient.CreateGatewayChan, ShouldHaveLength, 1)
						So(<-nsClient.CreateGatewayChan, ShouldResemble, ns.CreateGatewayRequest{
							Mac:         []byte{1, 2, 3, 4, 5, 6, 7, 8},
							Name:        "test-gateway",
							Description: "test gateway",
							Latitude:    1.1234,
							Longitude:   1.1235,
							Altitude:    5.5,
						})
					})

					Convey("Then the gateway was created in the config.C.PostgreSQL.DB", func() {
						_, err := storage.GetGateway(config.C.PostgreSQL.DB, lorawan.EUI64{1, 2, 3, 4, 5, 6, 7, 8}, false)
						So(err, ShouldBeNil)
					})

					Convey("When calling Get", func() {
						nsClient.GetGatewayResponse = getGatewayResponseNS
						resp, err := gatewayAPI.Get(ctx, &pb.GetGatewayRequest{
							Mac: "0102030405060708",
						})
						So(err, ShouldBeNil)
						So(validator.ctx, ShouldResemble, ctx)
						So(validator.validatorFuncs, ShouldHaveLength, 1)

						Convey("Then the expected response was returned", func() {
							So(resp.CreatedAt, ShouldNotEqual, "")
							So(resp.UpdatedAt, ShouldNotEqual, "")
							resp.CreatedAt = ""
							resp.UpdatedAt = ""
							So(resp, ShouldResemble, &getGatewayResponseAS)
						})

						Convey("Then the correct network-server request was made", func() {
							So(nsClient.GetGatewayChan, ShouldHaveLength, 1)
							So(<-nsClient.GetGatewayChan, ShouldResemble, ns.GetGatewayRequest{
								Mac: []byte{1, 2, 3, 4, 5, 6, 7, 8},
							})
						})
					})

					Convey("When adding the gateway to the gateway network", func() {
						addGNGateway := &pb.GatewayNetworkGatewayRequest{
							GatewayMAC: "0102030405060708",
							Id:         gn.Id,
						}
						_, err := api.AddGateway(ctx, addGNGateway)
						So(err, ShouldBeNil)

						validator.returnIsAdmin = true
						Convey("Then the gateway can be retrieved from the gateway network", func() {
							gw, err := api.GetGateway(ctx, &pb.GetGatewayNetworkGatewayRequest{
								Id:         gn.Id,
								GatewayMAC: addGNGateway.GatewayMAC,
							})
							So(err, ShouldBeNil)
							So(gw.Mac, ShouldEqual, addGNGateway.GatewayMAC)
							So(validator.validatorFuncs, ShouldHaveLength, 1)
						})

						Convey("When creating a second gateway to add to the gateway network", func() {
							gw := storage.Gateway{
								MAC:             lorawan.EUI64{8, 7, 6, 5, 4, 3, 2, 1},
								Name:            "test-gw2",
								Description:     "test gateway 2",
								OrganizationID:  org.ID,
								Ping:            true,
								NetworkServerID: n.ID,
								Tags:            pq.StringArray{"Test", "Test2"},
								MaxNodes:        64,
							}
							So(storage.CreateGateway(db, &gw), ShouldBeNil)
							gw.CreatedAt = gw.CreatedAt.Truncate(time.Millisecond).UTC()
							gw.UpdatedAt = gw.UpdatedAt.Truncate(time.Millisecond).UTC()

							Convey("Then it can be retrieved by its MAC", func() {
								_, err := storage.GetGateway(config.C.PostgreSQL.DB, lorawan.EUI64{8, 7, 6, 5, 4, 3, 2, 1}, false)
								So(err, ShouldBeNil)
							})

							// Add the gateway
							Convey("When adding the gateway to the gateway network", func() {
								addGNGateway := &pb.GatewayNetworkGatewayRequest{
									GatewayMAC: "0807060504030201",
									Id:         gn.Id,
								}
								_, err := api.AddGateway(ctx, addGNGateway)
								So(err, ShouldBeNil)

								validator.returnIsAdmin = true
								Convey("Then the gateway can be retrieved from the gateway network", func() {
									gw, err := api.GetGateway(ctx, &pb.GetGatewayNetworkGatewayRequest{
										Id:         gn.Id,
										GatewayMAC: addGNGateway.GatewayMAC,
									})
									So(err, ShouldBeNil)
									So(gw.Mac, ShouldEqual, addGNGateway.GatewayMAC)
									So(validator.validatorFuncs, ShouldHaveLength, 1)
								})

								Convey("When listing the gateways for the gateway network", func() {
									gws, err := api.ListGateways(ctx, &pb.ListGatewayNetworkGatewaysRequest{
										Id:     gn.Id,
										Limit:  10,
										Offset: 0,
									})
									So(err, ShouldBeNil)

									Convey("Then the nr of gateways should be 2", func() {
										So(gws.Result[0].Name, ShouldEqual, "test-gateway")
										So(gws.TotalCount, ShouldEqual, 2)
										So(gws.Result, ShouldHaveLength, 2)
									})
								})

								Convey("When trying to create a gateway network with an invalid gateway", func() {
									validator.returnIsAdmin = true
									createReq := &pb.CreateGatewayNetworkRequest{
										Name:           "testNetwork2",
										Description:    "A test network with an invalid gateway",
										PrivateNetwork: true,
										OrganizationID: org.ID,
										Gateways:       []*pb.Gateways{&pb.Gateways{"1111111111111111"}, &pb.Gateways{addGNGateway.GatewayMAC}},
									}
									_, err := api.Create(ctx, createReq)
									So(err, ShouldNotBeNil)
									So(errors.Cause(err), ShouldResemble, errToRPCError(storage.ErrDoesNotExist))

								})

								Convey("When creating a gateway network with the gateway added", func() {
									validator.returnIsAdmin = true
									createReq := &pb.CreateGatewayNetworkRequest{
										Name:           "testNetwork3",
										Description:    "A test network",
										PrivateNetwork: true,
										OrganizationID: org.ID,
										Gateways:       []*pb.Gateways{&pb.Gateways{addGNGateway.GatewayMAC}},
									}
									createResp, err := api.Create(ctx, createReq)
									So(err, ShouldBeNil)
									So(validator.validatorFuncs, ShouldHaveLength, 1)
									So(createResp, ShouldNotBeNil)

									Convey("Then the gateway network has been created", func() {
										gn, err := api.Get(ctx, &pb.GatewayNetworkRequest{
											Id: createResp.Id,
										})
										So(err, ShouldBeNil)
										So(gn.Name, ShouldEqual, createReq.Name)
										So(gn.Description, ShouldEqual, createReq.Description)
										So(gn.PrivateNetwork, ShouldEqual, createReq.PrivateNetwork)
										So(gn.OrganizationID, ShouldEqual, createReq.OrganizationID)

									})
								})

								Convey("When trying to create a gateway network with an invalid payment plan", func() {
									validator.returnIsAdmin = true
									createReq := &pb.CreateGatewayNetworkRequest{
										Name:           "testNetwork4",
										Description:    "A test network with an invalid payment plan",
										PrivateNetwork: true,
										OrganizationID: org.ID,
										PaymentPlans:   []*pb.PaymentPlans{&pb.PaymentPlans{
											Id: 34,
										}},
									}
									_, err := api.Create(ctx, createReq)
									So(err, ShouldNotBeNil)
									So(errors.Cause(err), ShouldResemble, errToRPCError(storage.ErrDoesNotExist))
								})

								Convey("When creating a gateway network with a payment plan", func() {
									validator.returnIsAdmin = true
									createReq := &pb.CreateGatewayNetworkRequest{
										Name:           "testNetwork5",
										Description:    "A test network with a payment plan",
										PrivateNetwork: true,
										OrganizationID: org.ID,
										PaymentPlans:   []*pb.PaymentPlans{
											&pb.PaymentPlans{
												Id: pp.ID,
											},
										},
									}
									createResp, err := api.Create(ctx, createReq)
									So(err, ShouldBeNil)
									So(validator.validatorFuncs, ShouldHaveLength, 1)
									So(createResp, ShouldNotBeNil)

									Convey("Then the gateway network has been created", func() {
										gn, err := api.Get(ctx, &pb.GatewayNetworkRequest{
											Id: createResp.Id,
										})
										So(err, ShouldBeNil)
										So(gn.Name, ShouldEqual, createReq.Name)
										So(gn.Description, ShouldEqual, createReq.Description)
										So(gn.PrivateNetwork, ShouldEqual, createReq.PrivateNetwork)
										So(gn.OrganizationID, ShouldEqual, createReq.OrganizationID)
									})

									Convey("Then the gateway network has a payment plan", func() {
										gnpp, err := payPlanAPI.GetGatewayNetwork(ctx, &pb.PayPlanGatewayNetworkRequest{
											Id:               pp.ID,
											GatewayNetworkID: createResp.Id,
										})
										So(err, ShouldBeNil)
										So(gnpp.Name, ShouldEqual, createReq.Name)
										So(gnpp.Id, ShouldEqual, createResp.Id)
									})
								})

								Convey("When removing the gateway from the gateway network", func() {
									delGNGateway := &pb.DeleteGatewayNetworkGatewayRequest{
										GatewayMAC: addGNGateway.GatewayMAC,
										Id:         addGNGateway.Id,
									}
									_, err := api.DeleteGateway(ctx, delGNGateway)
									So(err, ShouldBeNil)

									Convey("Then the gateway should be removed", func() {
										gnGateways, err := api.ListGateways(ctx, &pb.ListGatewayNetworkGatewaysRequest{
											Id:     gnId,
											Limit:  10,
											Offset: 0,
										})
										So(err, ShouldBeNil)
										So(gnGateways, ShouldNotBeNil)
										So(gnGateways.Result, ShouldHaveLength, 1)
									})
								})
							})
						})
					})


					// Add a new organization for adding to the gateway network.
					Convey("When adding an organization", func() {
						validator.returnIsAdmin = true
						org := storage.Organization{
							Name: "test-org",
						}
						So(storage.CreateOrganization(config.C.PostgreSQL.DB, &org), ShouldBeNil)

						Convey("When listing the gateway networks linked to the organization", func() {
							gns, err := api.ListOrganizationGatewayNetworks(ctx, &pb.ListGatewayNetworkOrganizationGatewayNetworksRequest{
								OrganizationID: org.ID,
								Limit:  10,
								Offset: 0,
							})
							So(err, ShouldBeNil)

							Convey("Then the organization should not see any gateway networks", func() {
								So(gns.TotalCount, ShouldEqual, 0)
								So(gns.Result, ShouldHaveLength, 0)
							})
						})

						Convey("When adding the organization to the gateway network", func() {
							addGNOrg := &pb.GatewayNetworkOrganizationRequest{
								Id:     		gnId,
								OrganizationID: org.ID,
							}
							_, err := api.AddOrganization(ctx, addGNOrg)
							So(err, ShouldBeNil)

							Convey("When listing the gateway networks for the organization", func() {
								gns, err := api.ListOrganizationGatewayNetworks(ctx, &pb.ListGatewayNetworkOrganizationGatewayNetworksRequest{
									OrganizationID: org.ID,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)

								Convey("Then the organization should see the gateway network", func() {
									So(gns.TotalCount, ShouldEqual, 1)
									So(gns.Result, ShouldHaveLength, 1)
								})
							})

							Convey("Then the organization should be linked to the gateway network", func() {
								gnOrgs, err := api.ListOrganization(ctx, &pb.ListGatewayNetworkOrganizationsRequest{
									Id:     gnId,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)
								So(gnOrgs.Result, ShouldHaveLength, 2)
								So(gnOrgs.Result[1].OrganizationId, ShouldEqual, org.ID)
								So(gnOrgs.Result[1].DisplayName, ShouldEqual, org.DisplayName)
							})

							Convey("Then the organization can be retrieved", func() {
								gnOrg, err := api.GetOrganization(ctx, &pb.GetGatewayNetworkOrganizationRequest{
									Id:     		gnId,
									OrganizationID: org.ID,
								})
								So(err, ShouldBeNil)
								So(gnOrg.OrganizationId, ShouldEqual, org.ID)
								So(gnOrg.DisplayName, ShouldEqual, org.DisplayName)
							})

							Convey("When removing the link between the organization and the gateway network", func() {
								delGNOrg := &pb.DeleteGatewayNetworkOrganizationRequest{
									OrganizationID:     addGNOrg.OrganizationID,
									Id: 				addGNOrg.Id,
								}
								_, err := api.DeleteOrganization(ctx, delGNOrg)
								So(err, ShouldBeNil)

								Convey("Then the organization should be removed", func() {
									gnOrgs, err := api.ListOrganization(ctx, &pb.ListGatewayNetworkOrganizationsRequest{
										Id:     gnId,
										Limit:  10,
										Offset: 0,
									})
									So(err, ShouldBeNil)
									So(gnOrgs, ShouldNotBeNil)
									So(gnOrgs.Result, ShouldHaveLength, 1)
								})
							})
						})
					})

					Convey("When deleting the gateway network", func() {
						validator.returnIsAdmin = true

						_, err := api.Delete(ctx, &pb.GatewayNetworkRequest{
							Id: gnId,
						})
						So(err, ShouldBeNil)
						So(validator.validatorFuncs, ShouldHaveLength, 1)

						Convey("Then the gateway network has been deleted", func() {
							gns, err := api.List(ctx, &pb.ListGatewayNetworksRequest{
								PrivateNetwork: 2,
								Limit:  10,
								Offset: 0,
							})
							So(err, ShouldBeNil)
							So(gns.Result, ShouldHaveLength, 0)
							So(gns.TotalCount, ShouldEqual, 0)

							Convey("When listing the gateways for the gateway network", func() {
								gws, err := api.ListGateways(ctx, &pb.ListGatewayNetworkGatewaysRequest{
									Id:     gn.Id,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)

								Convey("Then the nr of gateways should be 0", func() {
									So(gws.TotalCount, ShouldEqual, 0)
									So(gws.Result, ShouldHaveLength, 0)
								})
							})

							Convey("When listing the organizations for the gateway network", func() {
								orgs, err := api.ListOrganization(ctx, &pb.ListGatewayNetworkOrganizationsRequest{
									Id:     gn.Id,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)

								Convey("Then the nr of organizations should be 0", func() {
									So(orgs.TotalCount, ShouldEqual, 0)
									So(orgs.Result, ShouldHaveLength, 0)
								})
							})
						})
					})
				})

			})

		})
	})
}
