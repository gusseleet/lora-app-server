import React, { Component } from "react";
import { withRouter } from 'react-router-dom';

import DeviceProfileStore from "../../stores/DeviceProfileStore";
import SessionStore from "../../stores/SessionStore";
import DeviceProfileForm from "../../components/DeviceProfileForm";


class UpdateDeviceProfile extends Component {
  constructor() {
    super();

    this.state = {
      deviceProfile: {
          deviceProfile: {},
      },
      isAdmin: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    DeviceProfileStore.getDeviceProfile(this.props.match.params.deviceProfileID, (deviceProfile) => {
      this.setState({
        deviceProfile: deviceProfile,
        isAdmin: SessionStore.isAdmin(),
      });
    });
  }

  onSubmit(deviceProfile) {
    DeviceProfileStore.updateDeviceProfile(deviceProfile.deviceProfile.deviceProfileID, deviceProfile, (responseData) => {
      this.props.history.push(`/dashboard/${this.props.match.params.organizationID}/profiles`);
    });
  }

  render() {
    return(
      <div className="panel panel-default">
        <div className="panel-body">
          <DeviceProfileForm formName="Edit Device-Profile" organizationID={this.props.match.params.organizationID} deviceProfile={this.state.deviceProfile} onSubmit={this.onSubmit} />
        </div>
      </div>
    );
  }
}

export default withRouter(UpdateDeviceProfile);
