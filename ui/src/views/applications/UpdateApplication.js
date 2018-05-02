import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";

import ApplicationStore from "../../stores/ApplicationStore";
import ApplicationForm from "../../components/ApplicationForm";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  }
});

class UpdateApplication extends Component {
  constructor() {
    super();
    this.state = {
      application: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    ApplicationStore.getApplication(
      this.props.match.params.applicationID,
      application => {
        this.setState({ application: application });
      }
    );
  }

  onSubmit(application) {
    ApplicationStore.updateApplication(
      this.props.match.params.applicationID,
      this.state.application,
      responseData => {
        this.props.history.push(
          `/dashboard/${application.organizationID}/applications/${
            application.id
          }`
        );
      }
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="panel panel-default">
        <Card className={classes.card}>
          <CardContent>
            <ApplicationForm
              formName="Edit Application"
              application={this.state.application}
              onSubmit={this.onSubmit}
              update={true}
              organizationID={this.props.match.params.organizationID}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
}

UpdateApplication = withStyles(styles)(UpdateApplication);
export default withRouter(UpdateApplication);
