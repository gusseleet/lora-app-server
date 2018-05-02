import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import Typography from "material-ui/Typography";
import Checkbox from "material-ui/Checkbox";

import SessionStore from "../stores/SessionStore";

const styles = theme => ({
  textField: {
    width: 200
  },
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
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  },
  sideIcon: {
    paddingRight: 8,
    paddingTop: 6
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

class OrganizationForm extends Component {
  constructor() {
    super();

    this.state = {
      organization: {},
      showCanHaveGateways: SessionStore.isAdmin()
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      organization: nextProps.organization
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.organization);
  }

  onChange(field, e) {
    let organization = this.state.organization;
    if (e.target.type === "checkbox") {
      organization[field] = e.target.checked;
    } else {
      organization[field] = e.target.value;
    }
    this.setState({
      organization: organization
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <Typography variant="headline">{this.props.formName}</Typography>
        <TextField
          id="name"
          label="Organization name"
          className={classes.textField}
          required
          value={this.state.organization.name || ""}
          onChange={this.onChange.bind(this, "name")}
          pattern="[\w-]+"
        />
        <Typography component="p" className={classes.helpBox}>
          The name may only contain words, numbers and dashes.
        </Typography>

        <TextField
          id="name"
          label="Display name"
          className={classes.textField}
          required
          value={this.state.organization.displayName || ""}
          onChange={this.onChange.bind(this, "displayName")}
        />
        <FormGroup row>
          <TextField
            id="orgNr"
            label="Organization number"
            className={classes.textField}
            required
            value={this.state.organization.orgNr || ""}
            onChange={this.onChange.bind(this, "orgNr")}
            type="number"
          />
        </FormGroup>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!this.state.organization.canHaveGateways}
                onChange={this.onChange.bind(this, "canHaveGateways")}
                value="canHaveGateways"
              />
            }
            label="Can have gateways"
          />
          <Typography component="p" className={classes.helpBox}>
            When checked, it means that organization administrators are able to
            add their own gateways to the network. Note that the usage of the
            gateways is not limited to this organization.
          </Typography>
        </FormGroup>
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
      </form>
    );
  }
}

OrganizationForm = withStyles(styles)(OrganizationForm);
export default withRouter(OrganizationForm);
