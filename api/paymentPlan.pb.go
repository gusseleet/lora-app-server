// Code generated by protoc-gen-go. DO NOT EDIT.
// source: paymentPlan.proto

package api

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "google.golang.org/genproto/googleapis/api/annotations"

import (
	context "golang.org/x/net/context"
	grpc "google.golang.org/grpc"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// Request the payment plans defined in the system.
type ListPaymentPlansRequest struct {
	// Max number of payment plans to return in the result-set.
	Limit int32 `protobuf:"varint,1,opt,name=limit" json:"limit,omitempty"`
	// Offset in the result-set (for pagination).
	Offset int32 `protobuf:"varint,2,opt,name=offset" json:"offset,omitempty"`
	// When provided, the given string will be used to search on
	// Name.
	Search string `protobuf:"bytes,3,opt,name=search" json:"search,omitempty"`
}

func (m *ListPaymentPlansRequest) Reset()                    { *m = ListPaymentPlansRequest{} }
func (m *ListPaymentPlansRequest) String() string            { return proto.CompactTextString(m) }
func (*ListPaymentPlansRequest) ProtoMessage()               {}
func (*ListPaymentPlansRequest) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{0} }

func (m *ListPaymentPlansRequest) GetLimit() int32 {
	if m != nil {
		return m.Limit
	}
	return 0
}

func (m *ListPaymentPlansRequest) GetOffset() int32 {
	if m != nil {
		return m.Offset
	}
	return 0
}

func (m *ListPaymentPlansRequest) GetSearch() string {
	if m != nil {
		return m.Search
	}
	return ""
}

// Response of listing the payment plans
type ListPaymentPlansResponse struct {
	// Number of results
	TotalCount int32 `protobuf:"varint,1,opt,name=totalCount" json:"totalCount,omitempty"`
	// List of payment plans
	Result []*GetPaymentPlanResponse `protobuf:"bytes,2,rep,name=result" json:"result,omitempty"`
}

func (m *ListPaymentPlansResponse) Reset()                    { *m = ListPaymentPlansResponse{} }
func (m *ListPaymentPlansResponse) String() string            { return proto.CompactTextString(m) }
func (*ListPaymentPlansResponse) ProtoMessage()               {}
func (*ListPaymentPlansResponse) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{1} }

func (m *ListPaymentPlansResponse) GetTotalCount() int32 {
	if m != nil {
		return m.TotalCount
	}
	return 0
}

func (m *ListPaymentPlansResponse) GetResult() []*GetPaymentPlanResponse {
	if m != nil {
		return m.Result
	}
	return nil
}

// Request the payment plan information.
type PaymentPlanRequest struct {
	// Id of the payment plan.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
}

func (m *PaymentPlanRequest) Reset()                    { *m = PaymentPlanRequest{} }
func (m *PaymentPlanRequest) String() string            { return proto.CompactTextString(m) }
func (*PaymentPlanRequest) ProtoMessage()               {}
func (*PaymentPlanRequest) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{2} }

func (m *PaymentPlanRequest) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

// The response of a payment plan.
type GetPaymentPlanResponse struct {
	// ID of the payment plan.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	// The name of the payment plan.
	Name string `protobuf:"bytes,2,opt,name=name" json:"name,omitempty"`
	// The data limit of the payment plan.
	DataLimit int32 `protobuf:"varint,3,opt,name=dataLimit" json:"dataLimit,omitempty"`
	// The number of allowed devices of the payment plan.
	AllowedDevices int32 `protobuf:"varint,4,opt,name=allowedDevices" json:"allowedDevices,omitempty"`
	// The number of allowed applications of the payment plan.
	AllowedApplications int32 `protobuf:"varint,5,opt,name=allowedApplications" json:"allowedApplications,omitempty"`
	// The fixed price of the payment plan.
	FixedPrice int32 `protobuf:"varint,6,opt,name=fixedPrice" json:"fixedPrice,omitempty"`
	// The price of data that exceeds the data limit.
	AddedDataPrice int32 `protobuf:"varint,7,opt,name=addedDataPrice" json:"addedDataPrice,omitempty"`
}

func (m *GetPaymentPlanResponse) Reset()                    { *m = GetPaymentPlanResponse{} }
func (m *GetPaymentPlanResponse) String() string            { return proto.CompactTextString(m) }
func (*GetPaymentPlanResponse) ProtoMessage()               {}
func (*GetPaymentPlanResponse) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{3} }

func (m *GetPaymentPlanResponse) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *GetPaymentPlanResponse) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *GetPaymentPlanResponse) GetDataLimit() int32 {
	if m != nil {
		return m.DataLimit
	}
	return 0
}

func (m *GetPaymentPlanResponse) GetAllowedDevices() int32 {
	if m != nil {
		return m.AllowedDevices
	}
	return 0
}

func (m *GetPaymentPlanResponse) GetAllowedApplications() int32 {
	if m != nil {
		return m.AllowedApplications
	}
	return 0
}

func (m *GetPaymentPlanResponse) GetFixedPrice() int32 {
	if m != nil {
		return m.FixedPrice
	}
	return 0
}

func (m *GetPaymentPlanResponse) GetAddedDataPrice() int32 {
	if m != nil {
		return m.AddedDataPrice
	}
	return 0
}

// Add a new payment plan.
type CreatePaymentPlanRequest struct {
	// The payment plan name.
	Name string `protobuf:"bytes,1,opt,name=name" json:"name,omitempty"`
	// The data limit of the payment plan.
	DataLimit int32 `protobuf:"varint,2,opt,name=dataLimit" json:"dataLimit,omitempty"`
	// The number of allowed devices of the payment plan.
	AllowedDevices int32 `protobuf:"varint,4,opt,name=allowedDevices" json:"allowedDevices,omitempty"`
	// The number of allowed applications of the payment plan.
	AllowedApplications int32 `protobuf:"varint,5,opt,name=allowedApplications" json:"allowedApplications,omitempty"`
	// The fixed price of the payment plan.
	FixedPrice int32 `protobuf:"varint,6,opt,name=fixedPrice" json:"fixedPrice,omitempty"`
	// The price of data that exceeds the data limit.
	AddedDataPrice int32 `protobuf:"varint,7,opt,name=addedDataPrice" json:"addedDataPrice,omitempty"`
}

func (m *CreatePaymentPlanRequest) Reset()                    { *m = CreatePaymentPlanRequest{} }
func (m *CreatePaymentPlanRequest) String() string            { return proto.CompactTextString(m) }
func (*CreatePaymentPlanRequest) ProtoMessage()               {}
func (*CreatePaymentPlanRequest) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{4} }

func (m *CreatePaymentPlanRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *CreatePaymentPlanRequest) GetDataLimit() int32 {
	if m != nil {
		return m.DataLimit
	}
	return 0
}

func (m *CreatePaymentPlanRequest) GetAllowedDevices() int32 {
	if m != nil {
		return m.AllowedDevices
	}
	return 0
}

func (m *CreatePaymentPlanRequest) GetAllowedApplications() int32 {
	if m != nil {
		return m.AllowedApplications
	}
	return 0
}

func (m *CreatePaymentPlanRequest) GetFixedPrice() int32 {
	if m != nil {
		return m.FixedPrice
	}
	return 0
}

func (m *CreatePaymentPlanRequest) GetAddedDataPrice() int32 {
	if m != nil {
		return m.AddedDataPrice
	}
	return 0
}

// The response of the created payment plan.
type CreatePaymentPlanResponse struct {
	// The ID of the created payment plan.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
}

func (m *CreatePaymentPlanResponse) Reset()                    { *m = CreatePaymentPlanResponse{} }
func (m *CreatePaymentPlanResponse) String() string            { return proto.CompactTextString(m) }
func (*CreatePaymentPlanResponse) ProtoMessage()               {}
func (*CreatePaymentPlanResponse) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{5} }

func (m *CreatePaymentPlanResponse) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

// Update existing payment plan.
type UpdatePaymentPlanRequest struct {
	// ID of the payment plan to be updated.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	// The new name.
	Name string `protobuf:"bytes,2,opt,name=name" json:"name,omitempty"`
	// The data limit of the payment plan.
	DataLimit int32 `protobuf:"varint,3,opt,name=dataLimit" json:"dataLimit,omitempty"`
	// The number of allowed devices of the payment plan.
	AllowedDevices int32 `protobuf:"varint,4,opt,name=allowedDevices" json:"allowedDevices,omitempty"`
	// The number of allowed applications of the payment plan.
	AllowedApplications int32 `protobuf:"varint,5,opt,name=allowedApplications" json:"allowedApplications,omitempty"`
	// The fixed price of the payment plan.
	FixedPrice int32 `protobuf:"varint,6,opt,name=fixedPrice" json:"fixedPrice,omitempty"`
	// The price of data that exceeds the data limit.
	AddedDataPrice int32 `protobuf:"varint,7,opt,name=addedDataPrice" json:"addedDataPrice,omitempty"`
}

func (m *UpdatePaymentPlanRequest) Reset()                    { *m = UpdatePaymentPlanRequest{} }
func (m *UpdatePaymentPlanRequest) String() string            { return proto.CompactTextString(m) }
func (*UpdatePaymentPlanRequest) ProtoMessage()               {}
func (*UpdatePaymentPlanRequest) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{6} }

func (m *UpdatePaymentPlanRequest) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *UpdatePaymentPlanRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *UpdatePaymentPlanRequest) GetDataLimit() int32 {
	if m != nil {
		return m.DataLimit
	}
	return 0
}

func (m *UpdatePaymentPlanRequest) GetAllowedDevices() int32 {
	if m != nil {
		return m.AllowedDevices
	}
	return 0
}

func (m *UpdatePaymentPlanRequest) GetAllowedApplications() int32 {
	if m != nil {
		return m.AllowedApplications
	}
	return 0
}

func (m *UpdatePaymentPlanRequest) GetFixedPrice() int32 {
	if m != nil {
		return m.FixedPrice
	}
	return 0
}

func (m *UpdatePaymentPlanRequest) GetAddedDataPrice() int32 {
	if m != nil {
		return m.AddedDataPrice
	}
	return 0
}

// Empty responses for update and delete
type PaymentPlanEmptyResponse struct {
}

func (m *PaymentPlanEmptyResponse) Reset()                    { *m = PaymentPlanEmptyResponse{} }
func (m *PaymentPlanEmptyResponse) String() string            { return proto.CompactTextString(m) }
func (*PaymentPlanEmptyResponse) ProtoMessage()               {}
func (*PaymentPlanEmptyResponse) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{7} }

// Requests the gateway networks of a given payment plan
type ListPayPlanGatewayNetworksRequest struct {
	// The payment plan id.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	// Max number of gateways to return in the result-set.
	Limit int32 `protobuf:"varint,2,opt,name=limit" json:"limit,omitempty"`
	// Offset in the result-set (for pagination).
	Offset int32 `protobuf:"varint,3,opt,name=offset" json:"offset,omitempty"`
}

func (m *ListPayPlanGatewayNetworksRequest) Reset()         { *m = ListPayPlanGatewayNetworksRequest{} }
func (m *ListPayPlanGatewayNetworksRequest) String() string { return proto.CompactTextString(m) }
func (*ListPayPlanGatewayNetworksRequest) ProtoMessage()    {}
func (*ListPayPlanGatewayNetworksRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor13, []int{8}
}

func (m *ListPayPlanGatewayNetworksRequest) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *ListPayPlanGatewayNetworksRequest) GetLimit() int32 {
	if m != nil {
		return m.Limit
	}
	return 0
}

func (m *ListPayPlanGatewayNetworksRequest) GetOffset() int32 {
	if m != nil {
		return m.Offset
	}
	return 0
}

// Response for the gateway networks of a payment plan
type ListPayPlanGatewayNetworkResponse struct {
	// The total number of gateway networks of the payment plan.
	TotalCount int32 `protobuf:"varint,1,opt,name=totalCount" json:"totalCount,omitempty"`
	// The gateway networks in the requested limit, offset range.
	Result []*GetPayPlanGatewayNetworkResponse `protobuf:"bytes,2,rep,name=result" json:"result,omitempty"`
}

func (m *ListPayPlanGatewayNetworkResponse) Reset()         { *m = ListPayPlanGatewayNetworkResponse{} }
func (m *ListPayPlanGatewayNetworkResponse) String() string { return proto.CompactTextString(m) }
func (*ListPayPlanGatewayNetworkResponse) ProtoMessage()    {}
func (*ListPayPlanGatewayNetworkResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor13, []int{9}
}

func (m *ListPayPlanGatewayNetworkResponse) GetTotalCount() int32 {
	if m != nil {
		return m.TotalCount
	}
	return 0
}

func (m *ListPayPlanGatewayNetworkResponse) GetResult() []*GetPayPlanGatewayNetworkResponse {
	if m != nil {
		return m.Result
	}
	return nil
}

// Response for a specific gateway network of a payment plan
type GetPayPlanGatewayNetworkResponse struct {
	// ID of the Gateway Network.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	// When the gateway network was created.
	CreatedAt string `protobuf:"bytes,2,opt,name=createdAt" json:"createdAt,omitempty"`
	// When the gateway network was last updated.
	UpdatedAt string `protobuf:"bytes,3,opt,name=updatedAt" json:"updatedAt,omitempty"`
	// Gateway Network name.
	Name string `protobuf:"bytes,4,opt,name=name" json:"name,omitempty"`
	// Price of the gateway network.
	Desc string `protobuf:"bytes,5,opt,name=desc" json:"desc,omitempty"`
	// Is the network private or not.
	PrivateNetwork bool `protobuf:"varint,6,opt,name=privateNetwork" json:"privateNetwork,omitempty"`
	// Organization the gateway network belongs to.
	OrganizationID int64 `protobuf:"varint,7,opt,name=organizationID" json:"organizationID,omitempty"`
}

func (m *GetPayPlanGatewayNetworkResponse) Reset()         { *m = GetPayPlanGatewayNetworkResponse{} }
func (m *GetPayPlanGatewayNetworkResponse) String() string { return proto.CompactTextString(m) }
func (*GetPayPlanGatewayNetworkResponse) ProtoMessage()    {}
func (*GetPayPlanGatewayNetworkResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor13, []int{10}
}

func (m *GetPayPlanGatewayNetworkResponse) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *GetPayPlanGatewayNetworkResponse) GetCreatedAt() string {
	if m != nil {
		return m.CreatedAt
	}
	return ""
}

func (m *GetPayPlanGatewayNetworkResponse) GetUpdatedAt() string {
	if m != nil {
		return m.UpdatedAt
	}
	return ""
}

func (m *GetPayPlanGatewayNetworkResponse) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *GetPayPlanGatewayNetworkResponse) GetDesc() string {
	if m != nil {
		return m.Desc
	}
	return ""
}

func (m *GetPayPlanGatewayNetworkResponse) GetPrivateNetwork() bool {
	if m != nil {
		return m.PrivateNetwork
	}
	return false
}

func (m *GetPayPlanGatewayNetworkResponse) GetOrganizationID() int64 {
	if m != nil {
		return m.OrganizationID
	}
	return 0
}

// Request to get a specific gateway network of a specific payment plan
type PayPlanGatewayNetworkRequest struct {
	// The payment plan id.
	Id int64 `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	// The gateway network id.
	GatewayNetworkID int64 `protobuf:"varint,2,opt,name=gatewayNetworkID" json:"gatewayNetworkID,omitempty"`
}

func (m *PayPlanGatewayNetworkRequest) Reset()                    { *m = PayPlanGatewayNetworkRequest{} }
func (m *PayPlanGatewayNetworkRequest) String() string            { return proto.CompactTextString(m) }
func (*PayPlanGatewayNetworkRequest) ProtoMessage()               {}
func (*PayPlanGatewayNetworkRequest) Descriptor() ([]byte, []int) { return fileDescriptor13, []int{11} }

func (m *PayPlanGatewayNetworkRequest) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *PayPlanGatewayNetworkRequest) GetGatewayNetworkID() int64 {
	if m != nil {
		return m.GatewayNetworkID
	}
	return 0
}

func init() {
	proto.RegisterType((*ListPaymentPlansRequest)(nil), "api.ListPaymentPlansRequest")
	proto.RegisterType((*ListPaymentPlansResponse)(nil), "api.ListPaymentPlansResponse")
	proto.RegisterType((*PaymentPlanRequest)(nil), "api.PaymentPlanRequest")
	proto.RegisterType((*GetPaymentPlanResponse)(nil), "api.GetPaymentPlanResponse")
	proto.RegisterType((*CreatePaymentPlanRequest)(nil), "api.CreatePaymentPlanRequest")
	proto.RegisterType((*CreatePaymentPlanResponse)(nil), "api.CreatePaymentPlanResponse")
	proto.RegisterType((*UpdatePaymentPlanRequest)(nil), "api.UpdatePaymentPlanRequest")
	proto.RegisterType((*PaymentPlanEmptyResponse)(nil), "api.PaymentPlanEmptyResponse")
	proto.RegisterType((*ListPayPlanGatewayNetworksRequest)(nil), "api.ListPayPlanGatewayNetworksRequest")
	proto.RegisterType((*ListPayPlanGatewayNetworkResponse)(nil), "api.ListPayPlanGatewayNetworkResponse")
	proto.RegisterType((*GetPayPlanGatewayNetworkResponse)(nil), "api.GetPayPlanGatewayNetworkResponse")
	proto.RegisterType((*PayPlanGatewayNetworkRequest)(nil), "api.PayPlanGatewayNetworkRequest")
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// Client API for PaymentPlan service

type PaymentPlanClient interface {
	// Get payment plan list.
	List(ctx context.Context, in *ListPaymentPlansRequest, opts ...grpc.CallOption) (*ListPaymentPlansResponse, error)
	// Get data for a particular payment plan.
	Get(ctx context.Context, in *PaymentPlanRequest, opts ...grpc.CallOption) (*GetPaymentPlanResponse, error)
	// Create a new payment plan.
	Create(ctx context.Context, in *CreatePaymentPlanRequest, opts ...grpc.CallOption) (*CreatePaymentPlanResponse, error)
	// Update an existing payment plan.
	Update(ctx context.Context, in *UpdatePaymentPlanRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error)
	// Delete a payment plan.
	Delete(ctx context.Context, in *PaymentPlanRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error)
	ListGatewayNetworks(ctx context.Context, in *ListPayPlanGatewayNetworksRequest, opts ...grpc.CallOption) (*ListPayPlanGatewayNetworkResponse, error)
	GetGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*GetPayPlanGatewayNetworkResponse, error)
	AddGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error)
	DeleteGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error)
}

type paymentPlanClient struct {
	cc *grpc.ClientConn
}

func NewPaymentPlanClient(cc *grpc.ClientConn) PaymentPlanClient {
	return &paymentPlanClient{cc}
}

func (c *paymentPlanClient) List(ctx context.Context, in *ListPaymentPlansRequest, opts ...grpc.CallOption) (*ListPaymentPlansResponse, error) {
	out := new(ListPaymentPlansResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/List", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) Get(ctx context.Context, in *PaymentPlanRequest, opts ...grpc.CallOption) (*GetPaymentPlanResponse, error) {
	out := new(GetPaymentPlanResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/Get", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) Create(ctx context.Context, in *CreatePaymentPlanRequest, opts ...grpc.CallOption) (*CreatePaymentPlanResponse, error) {
	out := new(CreatePaymentPlanResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/Create", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) Update(ctx context.Context, in *UpdatePaymentPlanRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error) {
	out := new(PaymentPlanEmptyResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/Update", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) Delete(ctx context.Context, in *PaymentPlanRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error) {
	out := new(PaymentPlanEmptyResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/Delete", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) ListGatewayNetworks(ctx context.Context, in *ListPayPlanGatewayNetworksRequest, opts ...grpc.CallOption) (*ListPayPlanGatewayNetworkResponse, error) {
	out := new(ListPayPlanGatewayNetworkResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/ListGatewayNetworks", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) GetGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*GetPayPlanGatewayNetworkResponse, error) {
	out := new(GetPayPlanGatewayNetworkResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/GetGatewayNetwork", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) AddGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error) {
	out := new(PaymentPlanEmptyResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/AddGatewayNetwork", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *paymentPlanClient) DeleteGatewayNetwork(ctx context.Context, in *PayPlanGatewayNetworkRequest, opts ...grpc.CallOption) (*PaymentPlanEmptyResponse, error) {
	out := new(PaymentPlanEmptyResponse)
	err := grpc.Invoke(ctx, "/api.PaymentPlan/DeleteGatewayNetwork", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for PaymentPlan service

type PaymentPlanServer interface {
	// Get payment plan list.
	List(context.Context, *ListPaymentPlansRequest) (*ListPaymentPlansResponse, error)
	// Get data for a particular payment plan.
	Get(context.Context, *PaymentPlanRequest) (*GetPaymentPlanResponse, error)
	// Create a new payment plan.
	Create(context.Context, *CreatePaymentPlanRequest) (*CreatePaymentPlanResponse, error)
	// Update an existing payment plan.
	Update(context.Context, *UpdatePaymentPlanRequest) (*PaymentPlanEmptyResponse, error)
	// Delete a payment plan.
	Delete(context.Context, *PaymentPlanRequest) (*PaymentPlanEmptyResponse, error)
	ListGatewayNetworks(context.Context, *ListPayPlanGatewayNetworksRequest) (*ListPayPlanGatewayNetworkResponse, error)
	GetGatewayNetwork(context.Context, *PayPlanGatewayNetworkRequest) (*GetPayPlanGatewayNetworkResponse, error)
	AddGatewayNetwork(context.Context, *PayPlanGatewayNetworkRequest) (*PaymentPlanEmptyResponse, error)
	DeleteGatewayNetwork(context.Context, *PayPlanGatewayNetworkRequest) (*PaymentPlanEmptyResponse, error)
}

func RegisterPaymentPlanServer(s *grpc.Server, srv PaymentPlanServer) {
	s.RegisterService(&_PaymentPlan_serviceDesc, srv)
}

func _PaymentPlan_List_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ListPaymentPlansRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).List(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/List",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).List(ctx, req.(*ListPaymentPlansRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_Get_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PaymentPlanRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).Get(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/Get",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).Get(ctx, req.(*PaymentPlanRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_Create_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreatePaymentPlanRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).Create(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/Create",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).Create(ctx, req.(*CreatePaymentPlanRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_Update_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(UpdatePaymentPlanRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).Update(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/Update",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).Update(ctx, req.(*UpdatePaymentPlanRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_Delete_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PaymentPlanRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).Delete(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/Delete",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).Delete(ctx, req.(*PaymentPlanRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_ListGatewayNetworks_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ListPayPlanGatewayNetworksRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).ListGatewayNetworks(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/ListGatewayNetworks",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).ListGatewayNetworks(ctx, req.(*ListPayPlanGatewayNetworksRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_GetGatewayNetwork_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PayPlanGatewayNetworkRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).GetGatewayNetwork(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/GetGatewayNetwork",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).GetGatewayNetwork(ctx, req.(*PayPlanGatewayNetworkRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_AddGatewayNetwork_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PayPlanGatewayNetworkRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).AddGatewayNetwork(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/AddGatewayNetwork",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).AddGatewayNetwork(ctx, req.(*PayPlanGatewayNetworkRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PaymentPlan_DeleteGatewayNetwork_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PayPlanGatewayNetworkRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PaymentPlanServer).DeleteGatewayNetwork(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.PaymentPlan/DeleteGatewayNetwork",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PaymentPlanServer).DeleteGatewayNetwork(ctx, req.(*PayPlanGatewayNetworkRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _PaymentPlan_serviceDesc = grpc.ServiceDesc{
	ServiceName: "api.PaymentPlan",
	HandlerType: (*PaymentPlanServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "List",
			Handler:    _PaymentPlan_List_Handler,
		},
		{
			MethodName: "Get",
			Handler:    _PaymentPlan_Get_Handler,
		},
		{
			MethodName: "Create",
			Handler:    _PaymentPlan_Create_Handler,
		},
		{
			MethodName: "Update",
			Handler:    _PaymentPlan_Update_Handler,
		},
		{
			MethodName: "Delete",
			Handler:    _PaymentPlan_Delete_Handler,
		},
		{
			MethodName: "ListGatewayNetworks",
			Handler:    _PaymentPlan_ListGatewayNetworks_Handler,
		},
		{
			MethodName: "GetGatewayNetwork",
			Handler:    _PaymentPlan_GetGatewayNetwork_Handler,
		},
		{
			MethodName: "AddGatewayNetwork",
			Handler:    _PaymentPlan_AddGatewayNetwork_Handler,
		},
		{
			MethodName: "DeleteGatewayNetwork",
			Handler:    _PaymentPlan_DeleteGatewayNetwork_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "paymentPlan.proto",
}

func init() { proto.RegisterFile("paymentPlan.proto", fileDescriptor13) }

var fileDescriptor13 = []byte{
	// 786 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe4, 0x56, 0xc1, 0x6e, 0xd3, 0x4c,
	0x10, 0x96, 0xe3, 0xd4, 0x7f, 0x33, 0x95, 0xaa, 0x3f, 0xdb, 0x2a, 0x75, 0xdd, 0x50, 0xb5, 0x16,
	0x54, 0x51, 0x2a, 0x25, 0xd0, 0x9e, 0x00, 0x71, 0x88, 0x1a, 0x14, 0x55, 0xaa, 0x50, 0x65, 0x89,
	0x0b, 0x48, 0xc0, 0x12, 0x6f, 0xc3, 0x0a, 0xc7, 0x6b, 0xec, 0x4d, 0x4b, 0xa9, 0x7a, 0xe9, 0x89,
	0x3b, 0xe2, 0xc4, 0x85, 0x77, 0xe2, 0x0d, 0x10, 0xe2, 0xc8, 0x13, 0x20, 0x84, 0xbc, 0xde, 0x24,
	0xae, 0xe3, 0x6d, 0x02, 0xe2, 0x82, 0xb8, 0x79, 0x67, 0x26, 0xf3, 0xcd, 0x7c, 0x33, 0xfb, 0x6d,
	0xa0, 0x1c, 0xe0, 0xd3, 0x3e, 0xf1, 0xf9, 0xa1, 0x87, 0xfd, 0x46, 0x10, 0x32, 0xce, 0x90, 0x8e,
	0x03, 0x6a, 0x55, 0x7b, 0x8c, 0xf5, 0x3c, 0xd2, 0xc4, 0x01, 0x6d, 0x62, 0xdf, 0x67, 0x1c, 0x73,
	0xca, 0xfc, 0x28, 0x09, 0xb1, 0x9f, 0xc2, 0xca, 0x01, 0x8d, 0xf8, 0xe1, 0xf8, 0xb7, 0x91, 0x43,
	0x5e, 0x0d, 0x48, 0xc4, 0xd1, 0x32, 0xcc, 0x79, 0xb4, 0x4f, 0xb9, 0xa9, 0x6d, 0x68, 0xb5, 0x39,
	0x27, 0x39, 0xa0, 0x0a, 0x18, 0xec, 0xe8, 0x28, 0x22, 0xdc, 0x2c, 0x08, 0xb3, 0x3c, 0xc5, 0xf6,
	0x88, 0xe0, 0xb0, 0xfb, 0xc2, 0xd4, 0x37, 0xb4, 0x5a, 0xc9, 0x91, 0x27, 0x9b, 0x81, 0x39, 0x09,
	0x10, 0x05, 0xcc, 0x8f, 0x08, 0x5a, 0x07, 0xe0, 0x8c, 0x63, 0x6f, 0x8f, 0x0d, 0xfc, 0x21, 0x4c,
	0xca, 0x82, 0x76, 0xc1, 0x08, 0x49, 0x34, 0xf0, 0x62, 0x2c, 0xbd, 0xb6, 0xb0, 0xb3, 0xd6, 0xc0,
	0x01, 0x6d, 0x74, 0x48, 0x3a, 0xdb, 0x30, 0x99, 0x23, 0x43, 0xed, 0xeb, 0x80, 0x2e, 0xb9, 0x93,
	0x66, 0x16, 0xa1, 0x40, 0x5d, 0x01, 0xa1, 0x3b, 0x05, 0xea, 0xda, 0xdf, 0x35, 0xa8, 0xe4, 0x27,
	0xca, 0x86, 0x22, 0x04, 0x45, 0x1f, 0xf7, 0x89, 0xe8, 0xb7, 0xe4, 0x88, 0x6f, 0x54, 0x85, 0x92,
	0x8b, 0x39, 0x3e, 0x10, 0xfc, 0xe8, 0xa2, 0xf0, 0xb1, 0x01, 0x6d, 0xc1, 0x22, 0xf6, 0x3c, 0x76,
	0x42, 0xdc, 0x36, 0x39, 0xa6, 0x5d, 0x12, 0x99, 0x45, 0x11, 0x92, 0xb1, 0xa2, 0x9b, 0xb0, 0x24,
	0x2d, 0xad, 0x20, 0xf0, 0x68, 0x37, 0x99, 0x8c, 0x39, 0x27, 0x82, 0xf3, 0x5c, 0x31, 0x63, 0x47,
	0xf4, 0x35, 0x71, 0x0f, 0x43, 0xda, 0x25, 0xa6, 0x91, 0x30, 0x36, 0xb6, 0x08, 0x64, 0xd7, 0x25,
	0x6e, 0x1b, 0x73, 0x9c, 0xc4, 0xfc, 0x27, 0x91, 0x2f, 0x59, 0xed, 0x6f, 0x1a, 0x98, 0x7b, 0x21,
	0xc1, 0x9c, 0xe4, 0x70, 0x35, 0x6c, 0x58, 0x53, 0x35, 0x5c, 0xf8, 0xfb, 0x1a, 0xde, 0x86, 0xd5,
	0x9c, 0x7e, 0xf3, 0x27, 0x6e, 0xff, 0xd0, 0xc0, 0x7c, 0x18, 0xb8, 0xf9, 0xec, 0xfc, 0x0b, 0xeb,
	0x61, 0x81, 0x99, 0xea, 0xfc, 0x7e, 0x3f, 0xe0, 0xa7, 0x43, 0xb2, 0x6c, 0x0c, 0x9b, 0xf2, 0x42,
	0xc7, 0xbe, 0x0e, 0xe6, 0xe4, 0x04, 0x9f, 0x3e, 0x20, 0xfc, 0x84, 0x85, 0x2f, 0x23, 0x15, 0x49,
	0x23, 0x2d, 0x29, 0xe4, 0x6b, 0x89, 0x9e, 0xd6, 0x12, 0xfb, 0x42, 0xbb, 0x02, 0x63, 0x66, 0xf5,
	0xb8, 0x97, 0x51, 0x8f, 0x1b, 0x29, 0xf5, 0x50, 0xa7, 0x1d, 0xe9, 0xc8, 0x57, 0x0d, 0x36, 0xa6,
	0x05, 0x4f, 0xf4, 0x59, 0x85, 0x52, 0x57, 0xac, 0x99, 0xdb, 0xe2, 0x72, 0x23, 0xc6, 0x86, 0xd8,
	0x3b, 0x10, 0x6b, 0x15, 0x7b, 0x13, 0x99, 0x1c, 0x1b, 0x46, 0x8b, 0x54, 0x4c, 0x2d, 0x12, 0x82,
	0xa2, 0x4b, 0xa2, 0xae, 0x98, 0x79, 0xc9, 0x11, 0xdf, 0xf1, 0x10, 0x83, 0x90, 0x1e, 0x63, 0x4e,
	0x64, 0x35, 0x62, 0xd0, 0xf3, 0x4e, 0xc6, 0x1a, 0xc7, 0xb1, 0xb0, 0x87, 0x7d, 0xfa, 0x46, 0x6c,
	0xc7, 0x7e, 0x5b, 0x0c, 0x5b, 0x77, 0x32, 0x56, 0xfb, 0x11, 0x54, 0x15, 0x4d, 0xe6, 0xcf, 0xb2,
	0x0e, 0xff, 0xf7, 0x2e, 0x05, 0xee, 0xb7, 0x45, 0xab, 0xba, 0x33, 0x61, 0xdf, 0xf9, 0x3c, 0x0f,
	0x0b, 0xa9, 0x4d, 0x42, 0x4f, 0xa0, 0x18, 0x0f, 0x16, 0x55, 0xc5, 0x2c, 0x14, 0x2f, 0x8f, 0x75,
	0x4d, 0xe1, 0x95, 0x1b, 0xb8, 0x7a, 0xf1, 0xe9, 0xcb, 0xbb, 0xc2, 0x12, 0x2a, 0x8b, 0x37, 0x4d,
	0x3e, 0x7b, 0x41, 0x1c, 0x82, 0x1e, 0x83, 0xde, 0x21, 0x1c, 0xad, 0x88, 0x04, 0x93, 0x97, 0xd7,
	0xba, 0xea, 0x05, 0xb1, 0xd7, 0x45, 0x5e, 0x13, 0x55, 0x26, 0xf2, 0x36, 0xcf, 0xa8, 0x7b, 0x8e,
	0x08, 0x18, 0x89, 0x86, 0xa0, 0xa4, 0x40, 0x95, 0x80, 0x5a, 0xeb, 0x2a, 0xb7, 0x04, 0xaa, 0x0a,
	0xa0, 0x8a, 0x3d, 0xd9, 0xc0, 0x1d, 0xad, 0x8e, 0x28, 0x18, 0x89, 0xf8, 0x48, 0x18, 0x95, 0x12,
	0x49, 0x9a, 0x94, 0x17, 0x75, 0x53, 0xa0, 0xac, 0x59, 0x8a, 0x76, 0x62, 0xa8, 0x67, 0x60, 0xb4,
	0x89, 0x47, 0x38, 0x51, 0x33, 0x36, 0x05, 0x44, 0x72, 0x56, 0x57, 0x71, 0xf6, 0x5e, 0x83, 0xa5,
	0x78, 0x90, 0x19, 0x9d, 0x40, 0x5b, 0xe9, 0x11, 0xab, 0x85, 0xc4, 0x9a, 0x12, 0x37, 0xaa, 0xa3,
	0x21, 0xea, 0xa8, 0xa1, 0xad, 0xfc, 0x3a, 0x9a, 0x72, 0x33, 0xfd, 0x21, 0xfe, 0x47, 0x0d, 0xca,
	0x1d, 0x92, 0x29, 0x0b, 0x6d, 0x0e, 0x9b, 0x55, 0xde, 0x06, 0x6b, 0x36, 0x15, 0xb1, 0x5b, 0xa2,
	0x9e, 0xbb, 0xe8, 0xf6, 0x6c, 0xf5, 0x34, 0xcf, 0xb2, 0x57, 0xe7, 0x1c, 0xbd, 0xd5, 0xa0, 0xdc,
	0x72, 0xdd, 0x5f, 0x2f, 0x71, 0xca, 0xc8, 0x6e, 0x89, 0xd2, 0xb6, 0xed, 0x19, 0xa9, 0x8a, 0xf7,
	0xe4, 0x83, 0x06, 0xcb, 0xc9, 0xa2, 0xfc, 0xf1, 0x6a, 0x24, 0x51, 0xf5, 0xdf, 0x27, 0xea, 0xb9,
	0x21, 0xfe, 0xca, 0xee, 0xfe, 0x0c, 0x00, 0x00, 0xff, 0xff, 0xc9, 0x58, 0xce, 0xb5, 0x02, 0x0b,
	0x00, 0x00,
}
