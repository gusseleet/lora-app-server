import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";

import OrganizationStore from "../../stores/OrganizationStore";
import OrganizationForm from "../../components/OrganizationForm";
import SessionStore from "../../stores/SessionStore"

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    padding: 16,
    justifyContent: "center",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  }
});

class CreateOrganization extends Component {
  constructor() {
    super();

    this.state = {
      organization: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(organization) {
    OrganizationStore.createOrganization(organization, responseData => {
      SessionStore.fetchProfile(() => {
      this.props.history.push("/organizations");}
    );
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <div className="panel-body">
              <OrganizationForm
                formName="Create Organization"
                organization={this.state.organization}
                onSubmit={this.onSubmit}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

CreateOrganization = withStyles(styles)(CreateOrganization);
export default withRouter(CreateOrganization);
