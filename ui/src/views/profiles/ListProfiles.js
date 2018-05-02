import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withStyles } from "material-ui/styles";

import OrganizationStore from "../../stores/OrganizationStore";
import ListServiceProfiles from "../serviceprofiles/ListServiceProfiles";
import ListDeviceProfiles from "../deviceprofiles/ListDeviceProfiles";

const styles = theme => ({
  content: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    marginTop:30,
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    flex: 1,
    flexDirection: 'column',
  },
});

class ListProfiles extends Component {
  constructor() {
    super();

    this.state = {
      organization: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    OrganizationStore.getOrganization(
      this.props.match.params.organizationID,
      organization => {
        this.setState({
          organization: organization
        });
      }
    );
  }

  onSubmit(organization) {
    OrganizationStore.updateOrganization(
      this.props.match.params.organizationID,
      organization,
      responseData => {
        this.props.history.push("/organizations");
      }
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.content}>
          <ListDeviceProfiles
            location={this.props.location}
            organizationID={this.props.match.params.organizationID}
          />
          <ListServiceProfiles
            location={this.props.location}
            organizationID={this.props.match.params.organizationID}
          />
        </div>
      </div>
    );
  }
}

ListProfiles = withStyles(styles)(ListProfiles);
export default withRouter(ListProfiles);
