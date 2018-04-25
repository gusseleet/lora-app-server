package api

import (
	"github.com/jmoiron/sqlx"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/api/auth"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"time"
)

// PaymentPlanAPI exports the payment plan related functions.
type PaymentPlanAPI struct {
	validator auth.Validator
}

// NewPaymentPlanAPI creates a new Payment Plan API
func NewPaymentPlanAPI(validator auth.Validator) *PaymentPlanAPI {
	return &PaymentPlanAPI {
		validator: validator,
	}
}

// Create creates the given payment plan.
func (a *PaymentPlanAPI) Create(ctx context.Context, req *pb.CreatePaymentPlanRequest) (*pb.CreatePaymentPlanResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlansAccess(auth.Create)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	pp := storage.PaymentPlan {
		Name: 			req.Name,
		DataLimit: 		req.DataLimit,
		AllowedDevices: req.AllowedDevices,
		AllowedApps: 	req.AllowedApplications,
		FixedPrice: 	req.FixedPrice,
		AddedDataPrice: req.AddedDataPrice,
		OrganizationID: req.OrganizationID,
	}

	err := storage.CreatePaymentPlan(config.C.PostgreSQL.DB, &pp)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.CreatePaymentPlanResponse {
		Id: pp.ID,
	}, nil
}

// Get returns the payment plan matching the given ID.
func (a *PaymentPlanAPI) Get(ctx context.Context, req *pb.PaymentPlanRequest) (*pb.GetPaymentPlanResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanAccess(auth.Read, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	pp, err := storage.GetPaymentPlan(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetPaymentPlanResponse{
		Id:						pp.ID,
		Name:					pp.Name,
		DataLimit:				pp.DataLimit,
		AllowedDevices:			pp.AllowedDevices,
		AllowedApplications:	pp.AllowedApps,
		FixedPrice:				pp.FixedPrice,
		AddedDataPrice:			pp.AddedDataPrice,
		OrganizationID: 		pp.OrganizationID,
	}, nil
}

// List lists the payment plans to which the user has access.
func (a *PaymentPlanAPI) List(ctx context.Context, req *pb.ListPaymentPlansRequest) (*pb.ListPaymentPlansResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlansAccess(auth.List)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	var count int
	var pps []storage.PaymentPlan

	count, err := storage.GetPaymentPlanCount(config.C.PostgreSQL.DB, req.Search)
	if err != nil {
		return nil, errToRPCError(err)
	}
	pps, err = storage.GetPaymentPlans(config.C.PostgreSQL.DB, int(req.Limit), int(req.Offset), req.Search)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetPaymentPlanResponse, len(pps))
	for i, pp := range pps {
		result[i] = &pb.GetPaymentPlanResponse{
			Id:						pp.ID,
			Name:					pp.Name,
			DataLimit:				pp.DataLimit,
			AllowedDevices:			pp.AllowedDevices,
			AllowedApplications:	pp.AllowedApps,
			FixedPrice:				pp.FixedPrice,
			AddedDataPrice:			pp.AddedDataPrice,
			OrganizationID: 		pp.OrganizationID,
		}
	}

	return &pb.ListPaymentPlansResponse{
		TotalCount: int32(count),
		Result:		result,
	}, nil
}

// Update updates the given payment plan.
func (a *PaymentPlanAPI) Update(ctx context.Context, req *pb.UpdatePaymentPlanRequest) (*pb.PaymentPlanEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanAccess(auth.Update, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	pp, err := storage.GetPaymentPlan(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	pp.Name 			= req.Name
	pp.DataLimit 		= req.DataLimit
	pp.AllowedDevices 	= req.AllowedDevices
	pp.AllowedApps 		= req.AllowedApplications
	pp.FixedPrice 		= req.FixedPrice
	pp.AddedDataPrice 	= req.AddedDataPrice
	pp.OrganizationID	= req.OrganizationID

	err = storage.UpdatePaymentPlan(config.C.PostgreSQL.DB, &pp)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.PaymentPlanEmptyResponse{}, nil
}

// Delete deletes the given payment plan.
func (a *PaymentPlanAPI) Delete(ctx context.Context, req *pb.PaymentPlanRequest) (*pb.PaymentPlanEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanAccess(auth.Delete, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.Transaction(config.C.PostgreSQL.DB, func(tx sqlx.Ext) error {
		if err := storage.DeletePaymentPlan(tx, req.Id); err != nil {
			return errToRPCError(err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &pb.PaymentPlanEmptyResponse{}, nil
}

// ListGatewayNetworks lists the gateway networks linked to the payment plan.
func (a *PaymentPlanAPI) ListGatewayNetworks(ctx context.Context, req *pb.ListPayPlanGatewayNetworksRequest) (*pb.ListPayPlanGatewayNetworkResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanGatewayNetworksAccess(auth.List, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gatewayNetworks, err := storage.GetPaymentPlanToGatewayNetworks(config.C.PostgreSQL.DB, req.Id, int(req.Limit), int(req.Offset))
	if err != nil {
		return nil, errToRPCError(err)
	}

	gatewayNetworkCount, err := storage.GetPaymentPlanToGatewayNetworkCount(config.C.PostgreSQL.DB, req.Id)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetPayPlanGatewayNetworkResponse, len(gatewayNetworks))
	for i, gatewayNetwork := range gatewayNetworks {
		result[i] = &pb.GetPayPlanGatewayNetworkResponse{
			Id: 			gatewayNetwork.GatewayNetworkID,
			CreatedAt:		gatewayNetwork.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:		gatewayNetwork.UpdatedAt.Format(time.RFC3339Nano),
			Name:			gatewayNetwork.Name,
			PrivateNetwork:	gatewayNetwork.PrivateNetwork,
			OrganizationID: gatewayNetwork.OrganizationID,
			Desc: 			gatewayNetwork.Desc,
		}
	}

	return &pb.ListPayPlanGatewayNetworkResponse{
		TotalCount: int32(gatewayNetworkCount),
		Result:		result,
	}, nil
}

// GetGatewayNetwork returns the gateway network details for the given id.
func (a *PaymentPlanAPI) GetGatewayNetwork(ctx context.Context, req *pb.PayPlanGatewayNetworkRequest) (*pb.GetPayPlanGatewayNetworkResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanAccess(auth.Read, req.Id)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	gatewayNetwork, err := storage.GetPaymentPlanToGatewayNetwork(config.C.PostgreSQL.DB, req.Id, req.GatewayNetworkID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.GetPayPlanGatewayNetworkResponse{
		Id: 			gatewayNetwork.GatewayNetworkID,
		CreatedAt: 		gatewayNetwork.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt: 		gatewayNetwork.UpdatedAt.Format(time.RFC3339Nano),
		Name:			gatewayNetwork.Name,
		Desc:			gatewayNetwork.Desc,
		PrivateNetwork: gatewayNetwork.PrivateNetwork,
		OrganizationID: gatewayNetwork.OrganizationID,
	}, nil
}

// AddGatewayNetwork creates the given payment plan <-> gateway network link.
func (a *PaymentPlanAPI) AddGatewayNetwork(ctx context.Context, req *pb.PayPlanGatewayNetworkRequest) (*pb.PaymentPlanEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanGatewayNetworkAccess(auth.Create, req.Id, req.GatewayNetworkID)); err != nil {
			return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.CreatePaymentPlanToGatewayNetwork(config.C.PostgreSQL.DB, req.Id, req.GatewayNetworkID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.PaymentPlanEmptyResponse{}, nil
}

// DeleteGatewayNetwork deletes the given gateway network from the payment plan.
func (a *PaymentPlanAPI) DeleteGatewayNetwork(ctx context.Context, req *pb.PayPlanGatewayNetworkRequest) (*pb.PaymentPlanEmptyResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidatePaymentPlanGatewayNetworkAccess(auth.Delete, req.Id, req.GatewayNetworkID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}

	err := storage.DeletePaymentPlanToGatewayNetwork(config.C.PostgreSQL.DB, req.Id, req.GatewayNetworkID)
	if err != nil {
		return nil, errToRPCError(err)
	}

	return &pb.PaymentPlanEmptyResponse{}, nil
}