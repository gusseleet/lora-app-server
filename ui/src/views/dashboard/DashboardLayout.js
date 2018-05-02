import React, { Component } from "react";
import { Route, Switch, withRouter, Link } from "react-router-dom";

import { withStyles } from "material-ui/styles";
import SubNavbar from "../../components/SubNavbar";
import CreateGateways from "../gateways/CreateGateway";
import CreateGatewayNetworks from "../gatewaynetworks/CreateGatewayNetwork";
import Overview from "../overview/Overview";
import ListProfiles from "../profiles/ListProfiles";
import CreateServiceProfile from "../serviceprofiles/CreateServiceProfile";
import ListApplications from "../applications/ListApplications";
import CreateApplications from "../applications/CreateApplication";
import CreateDeviceProfile from "../deviceprofiles/CreateDeviceProfile";
import CreatePaymentPlan from "../paymentplan/CreatePaymentPlan";
import OrganizationSelect from "../../components/OrganizationSelect";
import UpdateDeviceProfile from "../deviceprofiles/UpdateDeviceProfile";
import UpdateServiceProfile from "../serviceprofiles/UpdateServiceProfile";
import GatewayNetworkDetails from "../gatewaynetworks/GatewayNetworkDetails";
import organizationStore from "../../stores/OrganizationStore";
import ListGateways from "../gateways/ListGateways";
import ListGatewayNetworks from "../gatewaynetworks/ListGatewayNetworks";

const styles = theme => ({
  wrapper: {
    margin: "auto",
    width: "100%",
    maxWidth: 1280,
    marginTop: 20
  },
  breadcrumbWrapper: {
    textDecorationLine: "none",
    height: 30,
    padding: 10,
    paddingLeft: 15,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    marginBottom: 20
  },
  dash: {
    marginLeft: 5,
    marginRight: 5,
    color: "#BDBDBD"
  },
  link: {
    textDecorationLine: "none", 
    color:"#F44336"
  }
});

class DashboardLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canHaveGateways: false,
    };
  }

  componentDidMount() {
    organizationStore.getOrganization(this.props.match.params.organizationID || -1, (response) => {
      this.setState({ canHaveGateways: response.canHaveGateways });
    });
  }

  render() {
    const { classes } = this.props;
    let activeTab = this.props.location.pathname.replace(this.props.match.url, '')
      ? this.props.location.pathname.replace(this.props.match.url, '').split(/\/((?:(?!\/).)*)(\/|$)/)[1]
      : "overview";

    var tabs = [
      {
        label: "Overview",
        url: `/dashboard/${this.props.match.params.organizationID}`,
        value: "overview",
      },
      this.state.canHaveGateways && {
        label: "Gateway Networks",
        url: `/dashboard/${this.props.match.params.organizationID}/gateway-networks`,
        value: "gateway-networks",
      },
      this.state.canHaveGateways && {
        label: "Gateways",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways`,
        value: "gateways",
      },
      !this.state.canHaveGateways && {
        label: "Applications",
        url: `/dashboard/${this.props.match.params.organizationID}/applications`,
        value: "applications",
      },
      {
        label: "profiles",
        url: `/dashboard/${this.props.match.params.organizationID}/profiles`,
        value: "profiles",
      }
    ].filter(Boolean)
    
    return (
      <div className={classes.wrapper}>
        <div className={classes.breadcrumbWrapper}>
          <Link className={classes.link} to="/">Dashboard</Link>
          <span className={classes.dash}>/</span>
          <OrganizationSelect />
        </div>
        <SubNavbar tabs={tabs} activeTab={activeTab}/>
        <div>
          <Switch>
            <Route
              exact
              path={`${this.props.match.path}/gateways`}
              component={ListGateways}
            />
            <Route
              exact
              path={`${this.props.match.path}/gateway-networks`}
              component={ListGatewayNetworks}
            />
            <Route exact path={this.props.match.path} component={Overview} />
            <Route
              exact
              path={`${this.props.match.path}/profiles`}
              component={ListProfiles}
            />
            <Route
              exact
              path={`${this.props.match.path}/profiles/create-service-profile`}
              component={CreateServiceProfile}
            />
            <Route
              exact
              path={`${this.props.match.path}/gateways/create`}
              component={CreateGateways}
            />
            <Route
              exact
              path={`${this.props.match.path}/gateway-networks/create`}
              component={CreateGatewayNetworks}
            />
            <Route
              exact
              path={`${this.props.match.path}/gateway-networks/:gatewayNetworkID`}
              component={GatewayNetworkDetails}
            />
            <Route
              exact
              path={`${this.props.match.path}/applications`}
              component={ListApplications}
            />
            <Route
              exact
              path={`${this.props.match.path}/applications/create`}
              component={CreateApplications}
            />
            <Route
              exact
              path={`${
                this.props.match.path
              }/gatewaynetworks/payment-plans/create`}
              component={CreatePaymentPlan}
            />
            <Route
              exact
              path={`${this.props.match.path}/profiles/create-device-profile`}
              component={CreateDeviceProfile}
            />
            <Route
              exact
              path={`${this.props.match.path}/profiles/device-profiles/:deviceProfileID`}
              component={UpdateDeviceProfile}
            />
            <Route
              exact
              path={`${this.props.match.path}/profiles/service-profiles/:serviceProfileID`}
              component={UpdateServiceProfile}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

DashboardLayout = withStyles(styles)(DashboardLayout);
export default withRouter(DashboardLayout);
