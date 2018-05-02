import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withTheme, MuiThemeProvider } from "material-ui/styles";

import ProtectedRoute from "./components/ProtectedRoute";
import * as constants from "./config/constants";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Errors from "./components/Errors";
import dispatcher from "./config/dispatcher";

// users
import Login from "./views/users/Login";
import CreateUser from "./views/users/CreateUser";
import UpdatePassword from "./views/users/UpdatePassword";
import UpdateUser from "./views/users/UpdateUser";

import theme from "./theme";

// organizations
import OrganizationRedirect from "./views/organizations/OrganizationRedirect";
import ListOrganizations from "./views/organizations/ListOrganizations";
import CreateOrganization from "./views/organizations/CreateOrganization";
import EditOrganization from "./views/organizations/EditOrganization";

// Gateway network
import JoinGatewayNetwork from "./views/gatewaynetworks/JoinGatewayNetwork";
// dashboard
import SubLayout from "./components/SubLayout";
import DashboardRedirect from "./views/dashboard/DashboardRedirect";

class Layout extends Component {
  onClick() {
    dispatcher.dispatch({
      type: "BODY_CLICK"
    });
  }

  render() {
    let activeTab = this.props.location.pathname.replace(this.props.match.url, '').split(/\/((?:(?!\/).)*)(\/|$)/)[0]

    return (
      <MuiThemeProvider theme={theme}>
        <div>
          { this.props.location.pathname !== "/users/create" &&
            this.props.location.pathname !== "/login" 
            ? (<Navbar activeTab={activeTab}/>) 
            : null
          }
          <div className="container" onClick={this.onClick}>
            <div className="row">
              <Errors />
              <Switch>
                <Route exact path="/login" component={Login} />
                <ProtectedRoute
                  exact
                  authorize={[constants.ADMIN_ROLE, constants.USER_ROLE]}
                  path="/"
                  component={DashboardRedirect}
                />

                <Route
                  path="/dashboard/:organizationID"
                  component={SubLayout}
                />

                <Route
                  exact
                  path="/join-a-network"
                  component={JoinGatewayNetwork}
                />

                <Route exact path="/" component={OrganizationRedirect} />
                <Route exact path="/users/create" component={CreateUser} />
                <Route
                  exact
                  path="/users/:userID/password"
                  component={UpdatePassword}
                />
                <Route
                  exact
                  path="/users/:userID/edit"
                  component={UpdateUser}
                />

                <Route
                  exact
                  path="/organizations"
                  component={ListOrganizations}
                />

                <Route
                  exact
                  path="/organizations/create"
                  component={CreateOrganization}
                />

                <Route
                  path="/organizations/:organizationID"
                  component={EditOrganization}
                />
              </Switch>
            </div>
          </div>
          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withTheme(theme)(Layout);
