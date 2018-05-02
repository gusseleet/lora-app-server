import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import SessionStore from "../../stores/SessionStore";

class DashboardRedirect extends Component {
  componentDidMount() {
    const organizationID = SessionStore.getOrganizationID();
    if (!isNaN(parseInt(organizationID, 10))) {
      this.props.history.push("/dashboard/" + organizationID);
    } else {
      // TODO: Test solution by fixing Register.
      const allOrgs = SessionStore.getOrganizations();
      if (allOrgs.length >= 1) {
        this.props.history.push("/dashboard/" + allOrgs[0].organizationID);
      } else {
        this.props.history.push("/organizations");
      }
    }
  }

  render() {
    return <div />;
  }
}

export default withRouter(DashboardRedirect);
