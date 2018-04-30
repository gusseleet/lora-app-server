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
		auth.ValidateGatewayNetworksAccess(auth.Create, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	for _,g := range req.Gateways{
		var mac lorawan.EUI64
		if err := mac.UnmarshalText([]byte(g.GatewayMAC)); err != nil {
			return nil, grpc.Errorf(codes.InvalidArgument, "bad gateway mac: %s", err)
		}

		if _,err := storage.GetGateway(config.C.PostgreSQL.DB, mac, false); err != nil{
			return nil, errToRPCError(err)
		}
	}

	for _, pp := range req.PaymentPlans{
		if _, err := storage.GetPaymentPlan(config.C.PostgreSQL.DB, pp.Id); err != nil {
			return nil, errToRPCError(err)
		}
	}

	gn := storage.GatewayNetwork{
		Name:            req.Name,
		Description:     req.Description,
		PrivateNetwork:  req.PrivateNetwork,
		OrganizationID:	 req.OrganizationID,
	}

	err := storage.CreateGatewayNetwork(config.C.PostgreSQL.DB, &gn)
	if err != nil {
		return nil, errToRPCError(err)
	}

	// Creates a link between the gateway network and the organization that created it.
	err = storage.CreateGatewayNetworkOrganization(config.C.PostgreSQL.DB, gn.ID, gn.OrganizationID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	for _,g := range req.Gateways{
		var mac lorawan.EUI64
		if err := mac.UnmarshalText([]byte(g.GatewayMAC)); err != nil {
			return nil, grpc.Errorf(codes.InvalidArgument, "bad gateway mac: %s", err)
		}

		if err = storage.CreateGatewayNetworkGateway(config.C.PostgreSQL.DB, gn.ID, mac); err != nil{
			return nil, errToRPCError(err)
		}
	}

	for _,pp := range req.PaymentPlans{
		if err = storage.CreatePaymentPlanToGatewayNetwork(config.C.PostgreSQL.DB, pp.Id, gn.ID); err != nil{
			return nil, errToRPCError(err)
		}
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
		Id:              	gn.ID,
		CreatedAt:       	gn.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt:       	gn.UpdatedAt.Format(time.RFC3339Nano),
		Name:           	gn.Name,
		Description:		gn.Description,
		PrivateNetwork:  	gn.PrivateNetwork,
		OrganizationID:	 	gn.OrganizationID,
	}, nil
}

// List lists the gateway networks to which the organization has access.
func (a *GatewayNetworkAPI) List(ctx context.Context, req *pb.ListGatewayNetworksRequest) (*pb.ListGatewayNetworksResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworksAccess(auth.List, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	var count int
	var gns []storage.GatewayNetwork
	var err error

	if req.OrganizationID == 0 {
		gns, err = storage.GetGatewayNetworks(config.C.PostgreSQL.DB, req.PrivateNetwork, int(req.Limit), int(req.Offset))
		if err != nil {
			return nil, errToRPCError(err)
		}

		count, err = storage.GetGatewayNetworkCount(config.C.PostgreSQL.DB, req.PrivateNetwork)
		if err != nil {
			return nil, errToRPCError(err)
		}
	} else {
		gns, err = storage.GetGatewayNetworksForOrganizationID(config.C.PostgreSQL.DB, req.OrganizationID, req.PrivateNetwork, int(req.Limit), int(req.Offset))
		if err != nil {
			return nil, errToRPCError(err)
		}
		count, err = storage.GetGatewayNetworkCountForOrganizationID(config.C.PostgreSQL.DB, req.OrganizationID, req.PrivateNetwork)
		if err != nil {
			return nil, errToRPCError(err)
		}
	}


	result := make([]*pb.GetGatewayNetworkResponse, len(gns))
	for i, gn := range gns {
		result[i] = &pb.GetGatewayNetworkResponse{
			Id:              gn.ID,
			CreatedAt:       gn.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:       gn.UpdatedAt.Format(time.RFC3339Nano),
			Name:            gn.Name,
			Description:	 gn.Description,
			PrivateNetwork:  gn.PrivateNetwork,
			OrganizationID:	 gn.OrganizationID,
		}
	}

	return &pb.ListGatewayNetworksResponse{
		TotalCount: int32(count),
		Result:     result,
	}, nil
}

// Update updates the given gateway network with the given data.
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
	gn.Description = req.Description
	gn.PrivateNetwork = req.PrivateNetwork
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

// ListOrganizationGatewayNetworks lists the gateway networks linked to the organization.
func (a *GatewayNetworkAPI) ListOrganizationGatewayNetworks(ctx context.Context, req *pb.ListGatewayNetworkOrganizationGatewayNetworksRequest) (*pb.ListGatewayNetworkOrganizationGatewayNetworksResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkOrganizationsAccess(auth.List, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gns, err := storage.GetGatewayNetworkOrganizationGatewayNetworks(config.C.PostgreSQL.DB, req.OrganizationID, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}

	gnCount, err := storage.GetGatewayNetworkOrganizationGatewayNetworkCount(config.C.PostgreSQL.DB, req.OrganizationID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetGatewayNetworkOrganizationGatewayNetworkResponse, len(gns))
	for i, gn := range gns {
		result[i] = &pb.GetGatewayNetworkOrganizationGatewayNetworkResponse{
			Id:     			gn.ID,
			Name:  		gn.Name,
			CreatedAt: 			gn.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt: 			gn.UpdatedAt.Format(time.RFC3339Nano),
		}
	}

	return &pb.ListGatewayNetworkOrganizationGatewayNetworksResponse{
		TotalCount: int32(gnCount),
		Result:     result,
	}, nil
}

// ListOrganization lists the organizations linked to the gateway network.
func (a *GatewayNetworkAPI) ListOrganization(ctx context.Context, req *pb.ListGatewayNetworkOrganizationsRequest) (*pb.ListGatewayNetworkOrganizationsResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkOrganizationsAccess(auth.List, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	organizations, err := storage.GetGatewayNetworkOrganizations(config.C.PostgreSQL.DB, req.Id, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}

	organizationCount, err := storage.GetGatewayNetworkOrganizationCount(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetGatewayNetworkOrganizationResponse, len(organizations))
	for i, organization := range organizations {
		result[i] = &pb.GetGatewayNetworkOrganizationResponse{
			OrganizationId:     organization.OrganizationID,
			DisplayName:  		organization.DisplayName,
			CreatedAt: 			organization.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt: 			organization.UpdatedAt.Format(time.RFC3339Nano),
		}
	}

	return &pb.ListGatewayNetworkOrganizationsResponse{
		TotalCount: int32(organizationCount),
		Result:     result,
	}, nil
}

// AddOrganization creates the given gateway network-organization link.
func (a *GatewayNetworkAPI) AddOrganization(ctx context.Context, req *pb.GatewayNetworkOrganizationRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkOrganizationsAccess(auth.Create, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}


	err := storage.CreateGatewayNetworkOrganization(config.C.PostgreSQL.DB, req.Id, req.OrganizationID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// DeleteOrganization deletes the given organization from the gateway network.
func (a *GatewayNetworkAPI) DeleteOrganization(ctx context.Context, req *pb.DeleteGatewayNetworkOrganizationRequest) (*pb.GatewayNetworkEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkOrganizationAccess(auth.Delete, req.Id, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.DeleteGatewayNetworkOrganization(config.C.PostgreSQL.DB, req.Id, req.OrganizationID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GatewayNetworkEmptyResponse{}, nil
}

// GetOrganization returns the organization details for the given organization ID.
func (a *GatewayNetworkAPI) GetOrganization(ctx context.Context, req *pb.GetGatewayNetworkOrganizationRequest) (*pb.GetGatewayNetworkOrganizationResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateGatewayNetworkOrganizationAccess(auth.Read, req.Id, req.OrganizationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	organization, err := storage.GetGatewayNetworkOrganization(config.C.PostgreSQL.DB, req.Id, req.OrganizationID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetGatewayNetworkOrganizationResponse{
		OrganizationId:     organization.OrganizationID,
		DisplayName:  		organization.DisplayName,
		CreatedAt: 			organization.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt: 			organization.UpdatedAt.Format(time.RFC3339Nano),
	}, nil
}