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
	"github.com/lib/pq"
	"time"
)

func TestGatewayNetworkAPI(t *testing.T) {
	conf := test.GetConfig()

	Convey("Given a clean database with an organization", t, func() {
		db, err := storage.OpenDatabase(conf.PostgresDSN)
		So(err, ShouldBeNil)
		config.C.PostgreSQL.DB = db
		test.MustResetDB(config.C.PostgreSQL.DB)

		ctx := context.Background()
		validator := &TestValidator{}
		api := NewGatewayNetworkAPI(validator)
		gatewayAPI := NewGatewayAPI(validator)
		userAPI := NewUserAPI(validator)

		org := storage.Organization{
			Name: "test-organization",
		}
		So(storage.CreateOrganization(config.C.PostgreSQL.DB, &org), ShouldBeNil)

		Convey("When creating a gateway network with a valid name", func() {
			validator.returnIsAdmin = true
			createReq := &pb.CreateGatewayNetworkRequest{
				Name:            "testNetwork",
				Tags:			 pq.StringArray{"Test", "test"},
				Price:     		 200,
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
				//So(gn.Tags, ShouldEqual, createReq.Tags)
				So(gn.Price, ShouldEqual, createReq.Price)
				So(gn.PrivateNetwork, ShouldEqual, createReq.PrivateNetwork)
				So(gn.OrganizationID, ShouldEqual, createReq.OrganizationID)
				gnId := int64(1)

				Convey("When updating the gateway network", func() {
					updateGN := &pb.UpdateGatewayNetworkRequest{
						Id:              gnId,
						Name:            "anotherNetwork",
						Tags:			 pq.StringArray{"Working", "works"},
						Price:     		 300,
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
						//So(gnUpd.Tags, ShouldResemble, updateGN.Tags)
						So(gnUpd.Price, ShouldResemble, updateGN.Price)
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

					// Add the gateway
					Convey("When adding the gateway to the gateway network", func() {
						addGNGateway := &pb.GatewayNetworkGatewayRequest{
							GatewayMAC: "0102030405060708",
							Id:  gn.Id,
						}
						_, err := api.AddGateway(ctx, addGNGateway)
						So(err, ShouldBeNil)

						Convey("When listing the gateways for the gateway network", func() {
							gws, err := api.ListGateways(ctx, &pb.ListGatewayNetworkGatewaysRequest{
								Id:		gn.Id,
								Limit:  10,
								Offset: 0,
							})
							So(err, ShouldBeNil)

							Convey("Then the nr of gateways should be 0", func() {
								So(gws.TotalCount, ShouldEqual, 1)
								So(gws.Result, ShouldHaveLength, 1)
							})
						})

						Convey("When removing the gateway from the gateway network", func() {
							delGNGateway := &pb.DeleteGatewayNetworkGatewayRequest{
								GatewayMAC:     addGNGateway.GatewayMAC,
								Id: 			addGNGateway.Id,
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
								So(gnGateways.Result, ShouldHaveLength, 0)
							})
						})
					})

					// Add a new user for adding to the gateway network.
					Convey("When adding a user", func() {
						userReq := &pb.AddUserRequest{
							Username:   "username",
							Password:   "pass^^ord",
							IsActive:   true,
							SessionTTL: 180,
							Email:      "foo@bar.com",
						}
						userResp, err := userAPI.Create(ctx, userReq)
						So(err, ShouldBeNil)

						validator.returnIsAdmin = false
						validator.returnUsername = userReq.Username

						Convey("When listing the gateway networks for the user", func() {
							gns, err := api.List(ctx, &pb.ListGatewayNetworksRequest{
								Limit:  10,
								Offset: 0,
							})
							So(err, ShouldBeNil)

							Convey("Then the user should not see any gateway networks", func() {
								So(gns.TotalCount, ShouldEqual, 0)
								So(gns.Result, ShouldHaveLength, 0)
							})
						})

						Convey("When adding the user to the gateway network", func() {
							addGNUser := &pb.GatewayNetworkUserRequest{
								Id:     gnId,
								UserID: userResp.Id,
							}
							_, err := api.AddUser(ctx, addGNUser)
							So(err, ShouldBeNil)

							Convey("When listing the gateway networks for the user", func() {
								gns, err := api.List(ctx, &pb.ListGatewayNetworksRequest{
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)

								Convey("Then the user should see the gateway network", func() {
									So(gns.TotalCount, ShouldEqual, 1)
									So(gns.Result, ShouldHaveLength, 1)
								})
							})

							Convey("Then the user should be part of the gateway network", func() {
								gnUsers, err := api.ListUsers(ctx, &pb.ListGatewayNetworkUsersRequest{
									Id:     gnId,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)
								So(gnUsers.Result, ShouldHaveLength, 1)
								So(gnUsers.Result[0].Id, ShouldEqual, userResp.Id)
								So(gnUsers.Result[0].Username, ShouldEqual, userReq.Username)
							})

							Convey("When removing the user from the gateway network", func() {
								delGNUser := &pb.DeleteGatewayNetworkUserRequest{
									Id:     addGNUser.Id,
									UserID: addGNUser.UserID,
								}
								_, err := api.DeleteUser(ctx, delGNUser)
								So(err, ShouldBeNil)

								Convey("Then the user should be removed", func() {
									gnUsers, err := api.ListUsers(ctx, &pb.ListGatewayNetworkUsersRequest{
										Id:     gnId,
										Limit:  10,
										Offset: 0,
									})
									So(err, ShouldBeNil)
									So(gnUsers, ShouldNotBeNil)
									So(gnUsers.Result, ShouldHaveLength, 0)
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

							Convey("When listing the users for the gateway network", func() {
								usrs, err := api.ListUsers(ctx, &pb.ListGatewayNetworkUsersRequest{
									Id:     gn.Id,
									Limit:  10,
									Offset: 0,
								})
								So(err, ShouldBeNil)

								Convey("Then the nr of users should be 0", func() {
									So(usrs.TotalCount, ShouldEqual, 0)
									So(usrs.Result, ShouldHaveLength, 0)
								})
							})
						})
					})
				})

			})

		})
	})
}
