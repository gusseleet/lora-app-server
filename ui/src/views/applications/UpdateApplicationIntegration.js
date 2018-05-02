import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ApplicationStore from "../../stores/ApplicationStore";
import ApplicationIntegrationForm from "../../components/ApplicationIntegrationForm";

import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";



const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden",
    },
  cardContent: {
    width: "100%"
  }
  });

class UpdateApplicationIntegration extends Component {
  constructor() {
    super();

    this.state = {
      integration: {},
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    ApplicationStore.getHTTPIntegration(this.props.match.params.applicationID, (integration) => {
      integration.kind = "http";
      this.setState({
        integration: integration,
      }); 
    });
  }

  onSubmit(integration) {
    ApplicationStore.updateHTTPIntegration(this.props.match.params.applicationID, integration, (responseData) => {
      this.props.history.push(`/organizations/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}/integrations`);
    });
  }

  onDelete() {
    if (window.confirm("Are you sure you want to delete this integration?")) {
      ApplicationStore.deleteHTTPIntegration(this.props.match.params.applicationID, (responseData) => {
        this.props.history.push(`/organizations/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}/integrations`);
      });
    }
  }

  render() {

    const { classes } = this.props;
    return(
      <div className="panel panel-default">
        <Card className={classes.card}>
         <CardContent className={classes.cardContent}>
          <div className="panel-heading clearfix">
            <h3 className="panel-title panel-title-buttons pull-left">Update integration</h3>
            <div className="btn-group pull-right">
              <a><button type="button" className="btn btn-danger btn-sm" onClick={this.onDelete}>Remove integration</button></a>
            </div>
          </div>
          <div className="panel-body">
            <ApplicationIntegrationForm integration={this.state.integration} onSubmit={this.onSubmit} />
          </div>
        </CardContent>
      </Card>
    </div>
    );
  }
}

UpdateApplicationIntegration = withStyles(styles)(UpdateApplicationIntegration);
export default withRouter(UpdateApplicationIntegration);
