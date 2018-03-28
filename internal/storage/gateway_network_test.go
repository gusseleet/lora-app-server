package storage

import (
	"testing"
	"time"

	"github.com/gusseleet/lora-app-server/internal/test"
	. "github.com/smartystreets/goconvey/convey"
	"github.com/lib/pq"
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
		})

		Convey("Then get gateway network count returns 1", func() {
			count, err := GetGatewayNetworkCount(db, "")
			So(err, ShouldBeNil)
			So(count, ShouldEqual, 1)
		})
	})
}