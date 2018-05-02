import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";

import SessionStore from "../stores/SessionStore";
import GatewayStore from "../stores/GatewayStore";
import PaymentPlanStore from "../stores/PaymentPlanStore";

import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import Typography from "material-ui/Typography";
import Checkbox from "material-ui/Checkbox";
import Button from "material-ui/Button";

const styles = theme => ({
  textField: {
    width: 200
  },
  multiline: {
    width: 300
  },
  spacingTop: {
    marginTop: 10
  },
  card: {
    width: "100%",
    maxWidth: 640,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  inlineCard: {
    width: "100%",
    maxWidth: 600,
    minHeight: 100,
    marginTop: 10
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  },
  button: {
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 6
  },
  buttonHolder: {
    marginTop: 30
  }
});

class GatewayNetworkForm extends Component {
  constructor() {
    super();

    this.state = {
      gateways: [],
      gatewaynetwork: {},
      addedGateways: [],
      update: false,
      paymentPlanOptions: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = name => event => {
    let gatewayNetwork = this.state.gatewaynetwork;
    if (name === "privateNetwork") {
      gatewayNetwork[name] = event.target.checked;
    } else if (name === "gateways") {
      let addedGateways = this.state.addedGateways;
      if (event.target.checked) {
        addedGateways.push({ gatewayMAC: event.target.value });
      } else {
        var index = addedGateways.indexOf({ gatewayMAC: event.target.value });
        addedGateways.splice(index, 1);
      }
      gatewayNetwork[name] = addedGateways;
      this.setState({
        addedGateways: addedGateways
      });
    }
    this.setState({
      gatewaynetwork: gatewayNetwork
    });
  };

  onChange(field, e) {
    let gatewayNetwork = this.state.gatewaynetwork;
    if (e.target.type === "number") {
      gatewayNetwork[field] = parseFloat(e.target.value);
    } else {
      gatewayNetwork[field] = e.target.value;
    }
    this.setState({
      gatewaynetwork: gatewayNetwork
    });
  }

  componentDidMount() {
    this.setState({
      gatewaynetwork: this.props.gatewaynetwork,
      isGlobalAdmin: SessionStore.isAdmin()
    });

    GatewayStore.getAllForOrganization(
      this.props.organizationID,
      9999,
      0,
      (totalCount, gateways) => {
        this.setState({
          gateways: gateways
        });
      }
    );

    // TODO: Get payment plans instead of network server store
    PaymentPlanStore.getAll(
      this.props.organizationID,
      "",
      9999,
      0,
      (totalCount, paymentPlans) => {
        this.setState({
          paymentPlanOptions: paymentPlans
        });
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gatewaynetwork.private === false) {
      nextProps.gatewaynetwork.private = false;
    }
    this.setState({
      gatewaynetwork: nextProps.gatewaynetwork
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.gatewaynetwork);
  }

  render() {
    const { classes } = this.props;
    const paymentPlanCheckboxes = this.state.paymentPlanOptions.map((pp, i) => {
      return (
        <FormControlLabel
          control={
            <Checkbox
              onChange={this.handleChange("privateNetwork")}
              value={pp.id}
            />
          }
          label={pp.name}
          key={i}
        />
      );
    });

    const gatewayCheckboxes = this.state.gateways.map((gw, i) => {
      return (
        <FormControlLabel
          control={
            // TODO: Error with unique key
            <Checkbox onChange={this.handleChange("gateways")} />
          }
          label={gw.name}
          value={gw.mac}
          key={i}
        />
      );
    });

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="headline">Create Gateway Network</Typography>
              <FormGroup row>
                <TextField
                  id="name"
                  label="Gateway network name"
                  className={classes.textField}
                  required
                  value={this.state.gatewaynetwork.name || ""}
                  pattern="[\w-]+"
                  onChange={this.onChange.bind(this, "name")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The name may only contain words, numbers and dashes.
              </Typography>
              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="description"
                  label="Gateway network description"
                  className={classes.multiline}
                  multiline
                  rows="4"
                  placeholder="An optional note about the gateway network..."
                  value={this.state.gatewaynetwork.description || ""}
                  onChange={this.onChange.bind(this, "description")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                A short description that will be visible for customers that
                wants to subscribe to this network.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={this.handleChange("privateNetwork")}
                    value={"privatenetwork"}
                    checked={this.state.gatewaynetwork.private}
                  />
                }
                label={"Private"}
              />
              <Typography component="p" className={classes.helpBox}>
                Decides wether the gateway network is public or private. A
                public network is available for anyone to subscribe to
                (commercial use), and a private network is invite only (private
                use).
              </Typography>
              <FormGroup row>
                <label className={classes.spacingTop} htmlFor="paymentPlan">
                  Payment plans
                </label>
                <div className={classes.inlineCard}>
                  {paymentPlanCheckboxes}
                </div>
                <Typography component="p" className={classes.helpBox}>
                  Select the payment plans for the gateway network
                </Typography>
              </FormGroup>
              <label className={classes.spacingTop} htmlFor="paymentPlan">
                Gateways
              </label>
              <div className={classes.checkBoxCardContainer}>
                <div className={classes.inlineCard}>{gatewayCheckboxes}</div>
              </div>
              <Typography component="p" className={classes.helpBox}>
                Select gateways to be contained inside the Gateway network.
                These gateways will be available to customers that register to
                this network.
              </Typography>

              <div className={classes.buttonHolder}>
                <Button
                  className={classes.button}
                  onClick={this.props.history.goBack}
                >
                  Go back
                </Button>
                <Button type="submit" variant="raised">
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }
}

GatewayNetworkForm = withStyles(styles)(GatewayNetworkForm);
export default withRouter(GatewayNetworkForm);
