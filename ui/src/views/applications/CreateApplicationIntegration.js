import React, { Component } from 'react';
import ApplicationStore from "../../stores/ApplicationStore";
import ApplicationIntegrationForm from "../../components/ApplicationIntegrationForm";
import Card, { CardContent } from "material-ui/Card";
import { withStyles } from "material-ui/styles";
import Typography from "material-ui/Typography";

const styles = theme => ({
  wrapper: {
    width: "100%",
    maxWidth: 1280,
    margin: "auto",
    marginTop: 30
  },
});

class CreateApplicationIntegration extends Component {
  constructor() {
    super();

    this.state = {
      integration: {},
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(integration) {
    ApplicationStore.createHTTPIntegration(this.props.match.params.applicationID, integration, (responseData) => {
      this.props.history.push(`/dashboard/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}/integrations`);
    });
  }

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.wrapper}>
        <Card>
          <CardContent>
            <div className="panel panel-default">
              <div className="panel-heading">
              <Typography variant="headline">ADD INTEGRATION</Typography>
              </div>
              <div className="panel-body">
                <ApplicationIntegrationForm integration={this.state.integration} onSubmit={this.onSubmit} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(CreateApplicationIntegration);
