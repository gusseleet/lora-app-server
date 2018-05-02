import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import DeviceProfileStore from "../../stores/DeviceProfileStore";
import DeviceProfileForm from "../../components/DeviceProfileForm";


class CreateDeviceProfile extends Component {
  constructor() {
    super();

    this.state = {
      deviceProfile: {
        deviceProfile: {}
      }
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(deviceProfile) {
    DeviceProfileStore.createDeviceProfile(deviceProfile, responseData => {
      this.props.history.push(
        `/organizations/${
          this.props.match.params.organizationID
        }/device-profiles`
      );
    });
  }

  componentDidMount() {
    this.setState({
      deviceProfile: {
        organizationID: this.props.match.params.organizationID,
        deviceProfile: {}
      }
    });
  }

  render() {
    return (
      <DeviceProfileForm
        formName="Create Device-Profile"
        organizationID={this.props.match.params.organizationID}
        deviceProfile={this.state.deviceProfile}
        onSubmit={this.onSubmit}
      />
    );
  }
}

export default withRouter(CreateDeviceProfile);
