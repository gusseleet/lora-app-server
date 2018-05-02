import React, { Component } from "react";
import { Route, Switch, withRouter, Link } from "react-router-dom";

import GatewayStore from "../../stores/GatewayStore";
import SessionStore from "../../stores/SessionStore";

import SubNavbar from "../../components/SubNavbar";
import { withStyles } from "material-ui/styles";

import GatewayDetails from "./GatewayDetails";
import UpdateGateway from "./UpdateGateway";
import GatewayToken from "./GatewayToken";
import GatewayPing from "./GatewayPing";
import GatewayFrameLogs from "./GatewayFrameLogs";

import OrganizationSelect from "../../components/OrganizationSelect";

const styles = theme => ({
  wrapper: {
    width: "100%",
    maxWidth: 1280,
    marginTop: 20,
    margin: "auto",
    flex: 1,
    flexDirection: "column"
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

class GatewayLayout extends Component {
  constructor() {
    super();

    this.state = {
      gateway: {},
      isAdmin: false
    };
  }

  componentDidMount() {
    GatewayStore.getGateway(this.props.match.params.mac, gateway => {
      this.setState({
        gateway: gateway
      });
    });

    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(this.props.match.params.organizationID)
    });

    SessionStore.on("change", () => {
      this.setState({
        isAdmin:
          SessionStore.isAdmin() ||
          SessionStore.isOrganizationAdmin(
            this.props.match.params.organizationID
          )
      });
    });

    GatewayStore.on("change", () => {
      GatewayStore.getGateway(this.props.match.params.mac, gateway => {
        this.setState({
          gateway: gateway
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    
    let activeTab = this.props.location.pathname.replace(this.props.match.url, '')
    ? this.props.location.pathname.replace(this.props.match.url, '').split(/\/((?:(?!\/).)*)(\/|$)/)[1]
    : "details";

    var tabs = [
      {
        label: "Details",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways/${
          this.props.match.params.mac
        }/`,
        value: "details"
      },
      {
        label: "Edit",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways/${
          this.props.match.params.mac
        }/edit`,
        value: "edit"
      },
      {
        label: "Token",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways/${
          this.props.match.params.mac
        }/token`,
        value: "token"
      },
      {
        label: "Ping",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways/${
          this.props.match.params.mac
        }/ping`,
        value: "ping"
      },
      {
        label: "Frames",
        url: `/dashboard/${this.props.match.params.organizationID}/gateways/${
          this.props.match.params.mac
        }/frames`,
        value: "frames"
      }
    ];
    const linkToGateways = `/dashboard/${
      this.props.match.params.organizationID
    }/gateways`;
    return (
      <div>
        <div className={classes.wrapper}>
          <div className={classes.breadcrumbWrapper}>
            <Link className={classes.link} to="/">Dashboard</Link>
            <span className={classes.dash}>/</span>
            <OrganizationSelect />
            <span className={classes.dash}>/</span>
            <Link className={classes.link} to={linkToGateways}>Gateways</Link>
            <span className={classes.dash}>/</span>
            <span className={classes.dash}>{this.state.gateway.name}</span>
          </div>
          <SubNavbar tabs={tabs} activeTab={activeTab} />
        </div>
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}/`}
            component={GatewayDetails}
          />
          <Route
            exact
            path={`${this.props.match.path}/edit`}
            component={UpdateGateway}
          />
          <Route
            exact
            path={`${this.props.match.path}/token`}
            component={GatewayToken}
          />
          <Route
            exact
            path={`${this.props.match.path}/ping`}
            component={GatewayPing}
          />
          <Route
            exact
            path={`${this.props.match.path}/frames`}
            component={GatewayFrameLogs}
          />
        </Switch>
      </div>
    );
  }
}
GatewayLayout = withStyles(styles)(GatewayLayout);
export default withRouter(GatewayLayout);
