import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";

import OrganizationStore from "../../stores/OrganizationStore";
import OrganizationForm from "../../components/OrganizationForm";
import OrganizationUsers from "./OrganizationUsers";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    display: "flex",
    justifyContent: "center"
  },
  contentLeft: {
    width: "50%"
  },
  contentRight: { width: "50%" }
});

class EditOrganization extends Component {
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
        <Card className={classes.card}>
          <CardContent className={classes.contentLeft}>
            <OrganizationForm
              formName="Edit Organization"
              organization={this.state.organization}
              onSubmit={this.onSubmit}
            />
          </CardContent>
          <CardContent className={classes.contentRight}>
            <OrganizationUsers organization={this.state.organization} location={this.props.location}/>
          </CardContent>
        </Card>
      </div>
    );
  }
}

EditOrganization = withStyles(styles)(EditOrganization);
export default withRouter(EditOrganization);
