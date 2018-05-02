import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import ServiceProfileStore from "../../stores/ServiceProfileStore";
import ServiceProfileForm from "../../components/ServiceProfileForm";

class CreateServiceProfile extends Component {
  constructor() {
    super();

    this.state = {
      serviceProfile: {
        serviceProfile: {}
      }
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(serviceProfile) {
    ServiceProfileStore.createServiceProfile(serviceProfile, responseData => {
      this.props.history.push(
        `/dashboard/${
          this.props.match.params.organizationID
        }/profiles`
      );
    });
  }

  componentDidMount() {
    this.setState({
      serviceProfile: {
        organizationID: this.props.match.params.organizationID,
        serviceProfile: {}
      }
    });
  }

  render() {
    return (
      <ServiceProfileForm
        formName="Create Service-Profile"
        organizationID={this.props.match.params.organizationID}
        serviceProfile={this.state.serviceProfile}
        onSubmit={this.onSubmit}
      />
    );
  }
}

export default withRouter(CreateServiceProfile);
