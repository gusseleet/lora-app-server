package api

import (
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/api/auth"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"github.com/brocaar/lorawan"
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
		auth.ValidateGatewayNetworksAccess(auth.Create)); err != nil {
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
		auth.ValidateGatewayNetworkAccess(auth.Read, req.Id)); err != nil {
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

	username, err := a.validator.GetUsername(ctx)
	if err != nil {
		return nil, errToRPCError(err)
	}
	count, err = storage.GetGatewayNetworkCountForUser(config.C.PostgreSQL.DB, username, req.Search)
	if err != nil {
		return nil, errToRPCError(err)
	}
	gns, err = storage.GetGatewayNetworksForUser(config.C.PostgreSQL.DB, username, int(req.Limit), int(req.Offset), req.Search)
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

// Update updates the given gateway network.
func (a *GatewayNetworkAPI) Update(ctx context.Context, req *pb.UpdateGatewayNetworkRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkAccess(auth.Update, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gn, err := storage.GetGatewayNetwork(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	gn.Name = req.Name
	gn.Tags = req.Tags
	gn.Price = req.Price
	gn.PrivateNetwork = req.PrivateNetwork
	gn.Tags = req.Tags
	gn.OrganizationID = req.OrganizationID

	err = storage.UpdateGatewayNetwork(config.C.PostgreSQL.DB, &gn)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// Delete deletes the gateway network matching the given ID.
func (a *GatewayNetworkAPI) Delete(ctx context.Context, req *pb.GatewayNetworkRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkAccess(auth.Delete, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.Transaction(config.C.PostgreSQL.DB, func(tx sqlx.Ext) error {
		if err := storage.DeleteGatewayNetwork(tx, req.Id); err != nil {
			return errToRPCError(err)
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// ListGateways lists the gateways linked to the gateway network.
func (a *GatewayNetworkAPI) ListGateways(ctx context.Context, req *pb.ListGatewayNetworkGatewaysRequest) (*pb.ListGatewayNetworkGatewaysResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkGatewaysAccess(auth.List, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gateways, err := storage.GetGatewayNetworkGateways(config.C.PostgreSQL.DB, req.Id, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}

	gatewayCount, err := storage.GetGatewayNetworkGatewayCount(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetGatewayNetworkGatewayResponse, len(gateways))
	for i, gateway := range gateways {
		result[i] = &pb.GetGatewayNetworkGatewayResponse{
			Mac:        gateway.GatewayMAC.String(),
			Name:  		gateway.Name,
			CreatedAt: 	gateway.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt: 	gateway.UpdatedAt.Format(time.RFC3339Nano),
		}
	}

	return &pb.ListGatewayNetworkGatewaysResponse{
		TotalCount: int32(gatewayCount),
		Result:     result,
	}, nil
}

// AddGateway creates the given gateway network-gateway link.
func (a *GatewayNetworkAPI) AddGateway(ctx context.Context, req *pb.GatewayNetworkGatewayRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkGatewaysAccess(auth.Create, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	var mac lorawan.EUI64
	if err := mac.UnmarshalText([]byte(req.GatewayMAC)); err != nil {
		return nil, grpc.Errorf(codes.InvalidArgument, "bad gateway mac: %s", err)
	}

	err := storage.CreateGatewayNetworkGateway(config.C.PostgreSQL.DB, req.Id, mac)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// DeleteGateway deletes the given gateway from the gateway network.
func (a *GatewayNetworkAPI) DeleteGateway(ctx context.Context, req *pb.DeleteGatewayNetworkGatewayRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	var mac lorawan.EUI64
	if err := mac.UnmarshalText([]byte(req.GatewayMAC)); err != nil {
		return nil, grpc.Errorf(codes.InvalidArgument, "bad gateway mac: %s", err)
	}

	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkGatewayAccess(auth.Delete, req.Id, mac)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.DeleteGatewayNetworkGateway(config.C.PostgreSQL.DB, req.Id, mac)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// GetGateway returns the gateway details for the given gateway MAC.
func (a *GatewayNetworkAPI) GetGateway(ctx context.Context, req *pb.GetGatewayNetworkGatewayRequest) (*pb.GetGatewayNetworkGatewayResponse, error) {
	var mac lorawan.EUI64
	if err := mac.UnmarshalText([]byte(req.GatewayMAC)); err != nil {
		return nil, grpc.Errorf(codes.InvalidArgument, "bad gateway mac: %s", err)
	}

	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkGatewayAccess(auth.Read, req.Id, mac)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gateway, err := storage.GetGatewayNetworkGateway(config.C.PostgreSQL.DB, req.Id, mac)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetGatewayNetworkGatewayResponse{
		Mac:        mac.String(),
		Name:  		gateway.Name,
		CreatedAt: 	gateway.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt: 	gateway.UpdatedAt.Format(time.RFC3339Nano),
	}, nil
}

// ListUsers lists the users linked to the gateway network.
func (a *GatewayNetworkAPI) ListUsers(ctx context.Context, req *pb.ListGatewayNetworkUsersRequest) (*pb.ListGatewayNetworkUsersResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkUsersAccess(auth.List, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	users, err := storage.GetGatewayNetworkUsers(config.C.PostgreSQL.DB, req.Id, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}

	userCount, err := storage.GetGatewayNetworkUserCount(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetGatewayNetworkUserResponse, len(users))
	for i, user := range users {
		result[i] = &pb.GetGatewayNetworkUserResponse{
			Id:        	user.UserID,
			Username:  		user.Username,
			CreatedAt: 	user.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt: 	user.UpdatedAt.Format(time.RFC3339Nano),
		}
	}

	return &pb.ListGatewayNetworkUsersResponse{
		TotalCount: int32(userCount),
		Result:     result,
	}, nil
}

// AddUser creates the given gateway network-user link.
func (a *GatewayNetworkAPI) AddUser(ctx context.Context, req *pb.GatewayNetworkUserRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkUsersAccess(auth.Create, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}


	err := storage.CreateGatewayNetworkUser(config.C.PostgreSQL.DB, req.Id, req.UserID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// DeleteUser deletes the given user from the gateway network.
func (a *GatewayNetworkAPI) DeleteUser(ctx context.Context, req *pb.DeleteGatewayNetworkUserRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkUserAccess(auth.Delete, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.DeleteGatewayNetworkUser(config.C.PostgreSQL.DB, req.Id, req.UserID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// GetUser returns the user details for the given user ID.
func (a *GatewayNetworkAPI) GetUser(ctx context.Context, req *pb.GetGatewayNetworkUserRequest) (*pb.GetGatewayNetworkUserResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkUserAccess(auth.Read, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	user, err := storage.GetGatewayNetworkUser(config.C.PostgreSQL.DB, req.Id, req.UserID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetGatewayNetworkUserResponse{
		Id:        	user.UserID,
		Username:  	user.Username,
		CreatedAt: 	user.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt: 	user.UpdatedAt.Format(time.RFC3339Nano),
	}, nil
}