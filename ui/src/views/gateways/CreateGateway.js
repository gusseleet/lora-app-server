import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import GatewayStore from "../../stores/GatewayStore";
import GatewayForm from "../../components/GatewayForm";

class CreateGateway extends Component {
  constructor() {
    super();

    this.state = {
      gateway: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    this.setState({
      gateway: { organizationID: this.props.match.params.organizationID }
    });
  }

  onSubmit(gateway) {
    GatewayStore.createGateway(gateway, responseData => {
      this.props.history.push(
        `/dashboard/${this.props.match.params.organizationID}/gateways`
      );
    });
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <GatewayForm
            formName="Create Gateway"
            organizationID={this.props.match.params.organizationID}
            gateway={this.state.gateway}
            onSubmit={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(CreateGateway);
