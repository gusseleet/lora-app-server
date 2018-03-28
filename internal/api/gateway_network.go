package api

import (
	"time"

	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/api/auth"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
)

// GatewayNetworkAPI exports the gateway network related functions.
type GatewayNetworkAPI struct {
	validator auth.Validator
}

// NewGatewayNetworkAPI creates a new GatewayNetworkAPI.
func NewGatewayNetworkAPI(validator auth.Validator) *GatewayNetworkAPI {
	return &GatewayNetworkAPI{
		validator: validator,
	}
}

// Create creates the given gateway network.
func (a *GatewayNetworkAPI) Create(ctx context.Context, req *pb.CreateGatewayNetworkRequest) (*pb.CreateGatewayNetworkResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkAccess(auth.Create)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gn := storage.GatewayNetwork{
		Name:            req.Name,
		Tags:			 req.Tags,
		Price:     		 req.Price,
		PrivateNetwork:  req.PrivateNetwork,
		OrganizationID:	 req.OrganizationID,
	}

	err := storage.CreateGatewayNetwork(config.C.PostgreSQL.DB, &gn)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.CreateGatewayNetworkResponse{
		Id: gn.ID,
	}, nil
}

// Get returns the gateway network matching the given ID.
func (a *GatewayNetworkAPI) Get(ctx context.Context, req *pb.GatewayNetworkRequest) (*pb.GetGatewayNetworkResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkAccess(auth.Read)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gn, err := storage.GetGatewayNetwork(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetGatewayNetworkResponse{
		Id:              gn.ID,
		CreatedAt:       gn.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt:       gn.UpdatedAt.Format(time.RFC3339Nano),
		Name:            gn.Name,
		Tags:			 gn.Tags,
		Price:			 gn.Price,
		PrivateNetwork:  gn.PrivateNetwork,
		OrganizationID:	 gn.OrganizationID,
	}, nil
}

// List lists the gateway networks to which the user has access.
func (a *GatewayNetworkAPI) List(ctx context.Context, req *pb.ListGatewayNetworksRequest) (*pb.ListGatewayNetworksResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworksAccess(auth.List)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	var count int
	var gns []storage.GatewayNetwork

	count, err := storage.GetGatewayNetworkCount(config.C.PostgreSQL.DB, req.Search)
	if err != nil {
		return nil, errToRPCError(err)
	}

	gns, err = storage.GetGatewayNetworks(config.C.PostgreSQL.DB, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}


	result := make([]*pb.GetGatewayNetworkResponse, len(gns))
	for i, gn := range gns {
		result[i] = &pb.GetGatewayNetworkResponse{
			Id:              gn.ID,
			CreatedAt:       gn.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:       gn.UpdatedAt.Format(time.RFC3339Nano),
			Tags:			 gn.Tags,
			Price:			 gn.Price,
			Name:            gn.Name,
			PrivateNetwork:  gn.PrivateNetwork,
			OrganizationID:	 gn.OrganizationID,
		}
	}

	return &pb.ListGatewayNetworksResponse{
		TotalCount: int32(count),
		Result:     result,
	}, nil
}

// Create creates the given gateway network-gateway link.
func (a *GatewayNetworkAPI) AddGateway(ctx context.Context, req *pb.GatewayNetworkGatewayRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkGatewayAccess(auth.Create, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.CreateGatewayNetworkGateway(config.C.PostgreSQL.DB, req.Id, req.GatewayMAC)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}