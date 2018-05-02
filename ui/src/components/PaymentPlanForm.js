import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";

import SessionStore from "../stores/SessionStore";
// Import Payment plan store

import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { FormGroup } from "material-ui/Form";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";

const styles = theme => ({
  textField: {
    width: 400
  },
  multiline: {
    width: 300
  },
  spacingTop: {
    marginTop: 10
  },
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  checkBoxCardContainer: {
    width: "100%",
    maxWidth: 600,
    minHeight: 200,
    display: "flex",
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
  },
  mapStyle: {
    width: "100%",
    height: 300
  }
});

class PaymentPlanForm extends Component {
  constructor() {
    super();

    this.state = {
      paymentplan: {},
      update: false,
      createPaymentPlanWindow: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  onChange(field, e) {
    let paymentPlan = this.state.paymentplan;

    if (e.target.type === "number") {
      paymentPlan[field] = parseFloat(e.target.value);
    } else {
      paymentPlan[field] = e.target.value;
    }

    this.setState({
      paymentplan: paymentPlan
    });
  }

  componentDidMount() {
    this.setState({
      paymentplan: this.props.paymentplan,
      isGlobalAdmin: SessionStore.isAdmin()
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      paymentplan: nextProps.paymentplan
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.paymentplan);
  }

  goBack() {
    this.props.closeWindow();
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="headline">{this.props.formName}</Typography>
              <FormGroup row>
                <TextField
                  id="name"
                  label="Payment plan name"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.name || ""}
                  pattern="[\w-]+"
                  onChange={this.onChange.bind(this, "name")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The name may only contain words, numbers and dashes.
              </Typography>
              <FormGroup row>
                <TextField
                  id="nrOfAllowedApps"
                  label="Number of allowed applications"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.allowedApplications || 0}
                  type="number"
                  onChange={this.onChange.bind(this, "allowedApplications")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The maximumnumber of applications allowed by this payment plan.
              </Typography>
              <FormGroup row>
                <TextField
                  id="nrOfAllowedDevices"
                  label="Number of allowed devices"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.allowedDevices || 0}
                  type="number"
                  onChange={this.onChange.bind(this, "allowedDevices")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The maximum number of devices allowed by this payment plan.
              </Typography>
              <FormGroup row>
                <TextField
                  id="fixedPrice"
                  label="Price per month"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.fixedPrice || 0}
                  type="number"
                  onChange={this.onChange.bind(this, "fixedPrice")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                This is the monthy fee that a subscriber will pay for this plan.
              </Typography>
              <FormGroup row>
                <TextField
                  id="dataLimit"
                  label="Maximum data limit"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.dataLimit || 0}
                  type="number"
                  onChange={this.onChange.bind(this, "dataLimit")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The maximum allowed data that can be sent when subscribed to
                this plan. When this limit is reached, the added data price will
                be activated.
              </Typography>
              <FormGroup row>
                <TextField
                  id="addedDataPrice"
                  label="Added data price when maximum is reached"
                  className={classes.textField}
                  required
                  value={this.state.paymentplan.addedDataPrice || 0}
                  type="number"
                  onChange={this.onChange.bind(this, "addedDataPrice")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                If maximum data limit is reached, this price will be activated
                per X sent Y.
              </Typography>

              <div className={classes.buttonHolder}>
                <Button className={classes.button} onClick={this.goBack}>
                  Cancel
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

PaymentPlanForm = withStyles(styles)(PaymentPlanForm);
export default withRouter(PaymentPlanForm);
