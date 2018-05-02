import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import DashboardLayout from "../views/dashboard/DashboardLayout";
import GatewayLayout from "../views/gateways/GatewayLayout";
import ApplicationLayout from "../views/applications/ApplicationLayout";
import NodeLayout from "../views/nodes/NodeLayout";

class SubLayout extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path={`${this.props.match.path}/gateways/:mac([A-Za-z0-9]{16})`}
            component={GatewayLayout}
          />
          <Route
            path={`${
              this.props.match.path
            }/applications/:applicationID/devices/:devEUI([A-Za-z0-9]{16})`}
            component={NodeLayout}
          />
          <Route
            path={`${
              this.props.match.path
            }/applications/:applicationID([0-9]+)`}
            component={ApplicationLayout}
          />
          <Route
            path={`${this.props.match.path}`}
            component={DashboardLayout}
          />
        </Switch>
      </div>
    );
  }
}

export default withRouter(SubLayout);
