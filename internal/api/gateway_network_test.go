package api

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"golang.org/x/net/context"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"github.com/gusseleet/lora-app-server/internal/test"
	"github.com/lib/pq"
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
			})
		})
	})
}
