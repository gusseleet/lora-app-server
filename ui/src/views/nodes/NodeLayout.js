import React, { Component } from "react";
import { Route, Switch, Link, withRouter } from "react-router-dom";

import NodeStore from "../../stores/NodeStore";
import ApplicationStore from "../../stores/ApplicationStore";
import DeviceProfileStore from "../../stores/DeviceProfileStore";
import SessionStore from "../../stores/SessionStore";

import SubNavbar from "../../components/SubNavbar";
import { withStyles } from "material-ui/styles";

import UpdateNode from "./UpdateNode";
import ActivateNode from "./ActivateNode";
import NodeFrameLogs from "./NodeFrameLogs";
import NodeKeys from "./NodeKeys";
import NodeActivation from "./NodeActivation";

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

class NodeLayout extends Component {
  constructor() {
    super();

    this.state = {
      application: {},
      node: {},
      deviceProfile: {
        deviceProfile: {}
      },
      isAdmin: false
    };

    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    NodeStore.getNode(
      this.props.match.params.applicationID,
      this.props.match.params.devEUI,
      node => {
        this.setState({ node: node });

        DeviceProfileStore.getDeviceProfile(
          this.state.node.deviceProfileID,
          deviceProfile => {
            this.setState({
              deviceProfile: deviceProfile
            });
          }
        );
      }
    );

    ApplicationStore.getApplication(
      this.props.match.params.applicationID,
      application => {
        this.setState({ application: application });
      }
    );

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
  }

  onDelete() {
    if (window.confirm("Are you sure you want to delete this node?")) {
      NodeStore.deleteNode(
        this.props.match.params.applicationID,
        this.props.match.params.devEUI,
        responseData => {
          this.props.history.push(
            `/dashboard/${
              this.props.match.params.organizationID
            }/applications/${this.props.match.params.applicationID}`
          );
        }
      );
    }
  }

  render() {
    const { classes } = this.props;
    var tabs = [
      {
        label: "Device configuration",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices/${
          this.props.match.params.devEUI
        }/edit`
      },
      {
        label: "Device keys (OOTA)",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices/${
          this.props.match.params.devEUI
        }/keys`
      },
      {
        label: "Activate device (ABP)",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices/${
          this.props.match.params.devEUI
        }/activate`
      },
      {
        label: "Device activation",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices/${
          this.props.match.params.devEUI
        }/activation`
      },
      {
        label: "Live frame logs",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices/${
          this.props.match.params.devEUI
        }/frames`
      }
    ];
    const linkToApplications = `/dashboard/${
      this.props.match.params.organizationID
    }/applications`;
    const linkToDevices = `/dashboard/${
      this.props.match.params.organizationID
    }/applications/${this.props.match.params.applicationID}/devices`;
    const linkToSelectedApplication = `/dashboard/${
      this.props.match.params.organizationID
    }/applications/${this.props.match.params.applicationID}`;
    return (
      <div>
        <div className={classes.wrapper}>
          <div className={classes.breadcrumbWrapper}>
            <Link className={classes.link} to="/">Dashboard</Link>
            <span className={classes.dash}>/</span>
            <OrganizationSelect />
            <span className={classes.dash}>/</span>
            <Link className={classes.link} to={linkToApplications}>Applications</Link>
            <span className={classes.dash}>/</span>
            <Link className={classes.link} to={linkToSelectedApplication}>
              {this.props.match.params.applicationID}
            </Link>
            <span className={classes.dash}>/</span>
            <Link className={classes.link} to={linkToDevices}>Devices</Link>
            <span className={classes.dash}>/</span>
            <span className={classes.dash}>{this.state.node.name}</span>
          </div>
          <SubNavbar tabs={tabs} />

          <Switch>
            <Route
              exact
              path={`${this.props.match.path}/edit`}
              component={UpdateNode}
            />
            <Route
              exact
              path={`${this.props.match.path}/activate`}
              component={ActivateNode}
            />
            <Route
              exact
              path={`${this.props.match.path}/frames`}
              component={NodeFrameLogs}
            />
            <Route
              exact
              path={`${this.props.match.path}/keys`}
              component={NodeKeys}
            />
            <Route
              exact
              path={`${this.props.match.path}/activation`}
              component={NodeActivation}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

NodeLayout = withStyles(styles)(NodeLayout);
export default withRouter(NodeLayout);
