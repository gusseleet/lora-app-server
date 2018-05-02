import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Card, { CardContent } from "material-ui/Card";

import ApplicationStore from "../../stores/ApplicationStore";
import ApplicationForm from "../../components/ApplicationForm";
import { withStyles } from "material-ui/styles";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  cardContent: {
    width: "100%"
  }
});
class CreateApplication extends Component {
  constructor() {
    super();
    this.state = {
      application: {}
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(application) {
    ApplicationStore.createApplication(application, responseData => {
      this.props.history.push(
        `/organizations/${
          this.props.match.params.organizationID
        }/applications/${responseData.id}`
      );
    });
  }

  componentDidMount() {
    this.setState({
      application: { organizationID: this.props.match.params.organizationID }
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="panel panel-default">
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <div className="panel-body">
              <ApplicationForm
                formName="Create Application"
                application={this.state.application}
                onSubmit={this.onSubmit}
                organizationID={this.props.match.params.organizationID}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
CreateApplication = withStyles(styles)(CreateApplication);
export default withRouter(CreateApplication);
