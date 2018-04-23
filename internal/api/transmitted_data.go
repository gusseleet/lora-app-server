package api

import (
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	pb "github.com/gusseleet/lora-app-server/api"
	"github.com/gusseleet/lora-app-server/internal/api/auth"
	"github.com/gusseleet/lora-app-server/internal/config"
	"github.com/gusseleet/lora-app-server/internal/storage"
	"time"
)

type TransmittedDataAPI struct {
	validator auth.Validator
}

func NewTransmittedDataAPI(validator auth.Validator) *TransmittedDataAPI {
	return &TransmittedDataAPI{
		validator: validator,
	}
}

// List lists the transmitted data.
func (a *TransmittedDataAPI) List(ctx context.Context, req *pb.ListTransmittedDataRequest) (*pb.ListTransmittedDataResponse, error) {
	if err := a.validator.Validate(ctx,
		auth.ValidateTransmittedDataAccess(auth.List, req.ApplicationID)); err != nil {
		return nil, grpc.Errorf(codes.Unauthenticated, "authentication failed: %s", err)
	}


	transmittedDatas, err := storage.GetTransmittedData(config.C.PostgreSQL.DB, req.Limit, req.Offset, req.ApplicationID, req.StartDate, req.EndDate, req.TransmittedType)
	if err != nil {
		return nil, errToRPCError(err)
	}

	transmittedDataCount, err := storage.GetTransmittedDataCount(config.C.PostgreSQL.DB, req.ApplicationID, req.StartDate, req.EndDate, req.TransmittedType)
	if err != nil {
		return nil, errToRPCError(err)
	}

	result := make([]*pb.GetTransmittedDataResponse, len(transmittedDatas))
	for i, transmittedData := range transmittedDatas {
		if transmittedData.TransmittedType == 1 {
			result[i] = &pb.GetTransmittedDataResponse{
				ApplicationID:		transmittedData.ApplicationID,
				Data: 				transmittedData.Data,
				Date: 				transmittedData.TransmittedAt.Format(time.RFC3339Nano),
				Type: 				"Up",
			}
		} else if transmittedData.TransmittedType == 2 {
			result[i] = &pb.GetTransmittedDataResponse{
				ApplicationID:		transmittedData.ApplicationID,
				Data: 				transmittedData.Data,
				Date: 				transmittedData.TransmittedAt.Format(time.RFC3339Nano),
				Type: 				"Down",
			}
		} else {
			result[i] = &pb.GetTransmittedDataResponse{
				ApplicationID:		transmittedData.ApplicationID,
				Data: 				transmittedData.Data,
				Date: 				transmittedData.TransmittedAt.Format(time.RFC3339Nano),
				Type: 				"Unknown",
			}
		}
	}

	return &pb.ListTransmittedDataResponse{
		TotalCount:	transmittedDataCount,
		Result: 	result,
	}, nil
}

