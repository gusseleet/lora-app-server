import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";

import GatewayNetworkStore from "../../stores/GatewayNetworkStore";
import GatewaynetworkForm from "../../components/GatewayNetworkForm";
import ListPaymentPlans from "../paymentplan/ListPaymentPlans";

const styles = theme => ({
  content: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",

    display: "flex",
    justifyContent: "center"
  },
  contentLeft: {
    width: "50%",
    padding: 0,
    marginRight: 5
  },
  contentRight: {
    width: "50%",
    padding: 0,
    marginLeft: 5
  }
});

class CreateGatewayNetwork extends Component {
  constructor() {
    super();

    this.state = {
      gatewaynetwork: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    this.setState({
      gatewaynetwork: { organizationID: this.props.match.params.organizationID }
    });
  }
  onSubmit(gatewayNetwork) {
    GatewayNetworkStore.createGatewayNetwork(gatewayNetwork, responseData => {
      this.props.history.push(
        `/dashboard/${this.props.match.params.organizationID}/gateways`
      );
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.content}>
        <div className={classes.contentLeft}>
          <GatewaynetworkForm
            organizationID={this.props.match.params.organizationID}
            gatewaynetwork={this.state.gatewaynetwork}
            onSubmit={this.onSubmit}
          />
        </div>
        <div className={classes.contentRight}>
          <ListPaymentPlans
            organizationID={this.props.match.params.organizationID}
          />
        </div>
      </div>
    );
  }
}

CreateGatewayNetwork = withStyles(styles)(CreateGatewayNetwork);
export default withRouter(CreateGatewayNetwork);
