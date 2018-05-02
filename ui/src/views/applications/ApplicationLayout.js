import React, { Component } from "react";
import { Route, Switch, withRouter, Link } from "react-router-dom";

import SessionStore from "../../stores/SessionStore";
import ApplicationStore from "../../stores/ApplicationStore";

import SubNavbar from "../../components/SubNavbar";
import { withStyles } from "material-ui/styles";

// devices
import ListNodes from "../nodes/ListNodes";
import CreateNode from "../nodes/CreateNode";

// applications
import UpdateApplication from "./UpdateApplication";
import ApplicationIntegrations from "./ApplicationIntegrations";
import CreateApplicationIntegration from "./CreateApplicationIntegration";
import UpdateApplicationIntegration from "./UpdateApplicationIntegration";

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

class ApplicationLayout extends Component {
  constructor() {
    super();

    this.state = {
      application: {},
      isAdmin: false
    };

    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
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
    if (window.confirm("Are you sure you want to delete this application?")) {
      ApplicationStore.deleteApplication(
        this.props.match.params.applicationID,
        responseData => {
          this.props.history.push(
            `/organizations/${
              this.props.match.params.organizationID
            }/applications`
          );
        }
      );
    }
  }

  render() {
    const { classes } = this.props;

    let activeTab = this.props.location.pathname.replace(this.props.match.url, '')
    ? this.props.location.pathname.replace(this.props.match.url, '').split(/\/((?:(?!\/).)*)(\/|$)/)[1]
    : "edit";

    var tabs = [
      {
        label: "Devices",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/devices`,
        value: "devices",
      },
      {
        label: "Edit",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/`,
        value: "edit",
      },
      {
        label: "Integrations",
        url: `/dashboard/${
          this.props.match.params.organizationID
        }/applications/${this.props.match.params.applicationID}/integrations`,
        value: "integrations",
      }
    ];
    const linkToApplications = `/dashboard/${
      this.props.match.params.organizationID
    }/applications`;
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
            <span className={classes.dash}>{this.props.match.params.applicationID}</span>
          </div>
          <SubNavbar tabs={tabs} activeTab={activeTab}/>
        </div>
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}/devices`}
            component={ListNodes}
          />
          <Route
            exact
            path={`${this.props.match.path}/devices/create`}
            component={CreateNode}
          />
          <Route
            exact
            path={`${this.props.match.path}/integrations`}
            component={ApplicationIntegrations}
          />
          <Route
            exact
            path={`${this.props.match.path}/`}
            component={UpdateApplication}
          />
          <Route
            exact
            path={`${this.props.match.path}/integrations/create`}
            component={CreateApplicationIntegration}
          />
          <Route
            exact
            path={`${this.props.match.path}/integrations/http`}
            component={UpdateApplicationIntegration}
          />
        </Switch>
      </div>
    );
  }
}

ApplicationLayout = withStyles(styles)(ApplicationLayout);
export default withRouter(ApplicationLayout);
