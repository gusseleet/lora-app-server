import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import ServiceProfileStore from "../../stores/ServiceProfileStore";
import SessionStore from "../../stores/SessionStore";
import ServiceProfileForm from "../../components/ServiceProfileForm";

class UpdateServiceProfile extends Component {
  constructor() {
    super();

    this.state = {
      serviceProfile: {
        serviceProfile: {}
      },
      isAdmin: false
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    ServiceProfileStore.getServiceProfile(
      this.props.match.params.serviceProfileID,
      serviceProfile => {
        this.setState({
          serviceProfile: serviceProfile,
          isAdmin: SessionStore.isAdmin()
        });
      }
    );

    SessionStore.on("change", () => {
      this.setState({
        isAdmin: SessionStore.isAdmin()
      });
    });
  }

  onSubmit(serviceProfile) {
    ServiceProfileStore.updateServiceProfile(
      serviceProfile.serviceProfile.serviceProfileID,
      serviceProfile,
      responseData => {
        this.props.history.push(
          `/dashboard/${this.props.match.params.organizationID}/profiles`
        );
      }
    );
  }

  onDelete() {
    if (
      window.confirm("Are you sure you want to delete this service-profile?")
    ) {
      ServiceProfileStore.deleteServiceProfile(
        this.props.match.params.serviceProfileID,
        responseData => {
          this.props.history.push(
            `/dashboard/${this.props.match.params.organizationID}/profiles`
          );
        }
      );
    }
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <ServiceProfileForm
            formName="Edit Service-Profile"
            organizationID={this.props.match.params.organizationID}
            serviceProfile={this.state.serviceProfile}
            onSubmit={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(UpdateServiceProfile);
