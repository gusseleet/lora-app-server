import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "material-ui/styles";

import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { FormGroup } from "material-ui/Form";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";
import Dropdown from "./Dropdown";

import DeviceProfileStore from "../stores/DeviceProfileStore";

const styles = theme => ({
  textField: {
    width: 200
  },
  whitespace: {
    marginTop: 10
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
  button: {
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 6
  },
  buttonHolder: {
    marginTop: 30
  }
});

class NodeForm extends Component {
  constructor() {
    super();

    this.state = {
      node: {},
      devEUIDisabled: false,
      disabled: false,
      deviceProfiles: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({
      node: this.props.node
    });

    DeviceProfileStore.getAllForApplicationID(
      this.props.applicationID,
      9999,
      0,
      (totalCount, deviceProfiles) => {
        this.setState({
          deviceProfiles: deviceProfiles
        });
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      node: nextProps.node,
      devEUIDisabled: typeof nextProps.node.devEUI !== "undefined",
      disabled: nextProps.disabled
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.node);
  }

  onChange(field, e) {
    let node = this.state.node;
    if (e.target.type === "number") {
      node[field] = parseInt(e.target.value, 16);
    } else if (e.target.type === "checkbox") {
      node[field] = e.target.checked;
    } else {
      node[field] = e.target.value;
    }
    this.setState({ node: node });
  }

  onSelectChange(field, event) {
    let node = this.state.node;
    if (event !== null) {
      node[field] = event.target.value;
    } else {
      node[field] = null;
    }
    this.setState({
      node: node
    });
  }

  render() {
    const { classes } = this.props;

    const deviceProfileOptions = this.state.deviceProfiles.map(
      (deviceProfile, i) => {
        return {
          value: deviceProfile.deviceProfileID,
          label: deviceProfile.name
        };
      }
    );

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="headline">{this.props.formName}</Typography>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="name"
                  label="Device name"
                  className={classes.textField}
                  type="text"
                  placeholder="e.g. 'garden-sensor'"
                  value={this.state.node.name || ""}
                  pattern="[\w-]+"
                  onChange={this.onChange.bind(this, "name")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The name may only contain words, numbers and dashes.
              </Typography>

              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="description"
                  label="Device description"
                  className={classes.textField}
                  type="text"
                  placeholder="a short description of your node"
                  required
                  value={this.state.node.description || ""}
                  onChange={this.onChange.bind(this, "description")}
                />
              </FormGroup>

              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="eui"
                  label="Device EUI"
                  className={classes.textField}
                  type="text"
                  placeholder="0000000000000000"
                  pattern="[A-Fa-f0-9]{16}"
                  required
                  disabled={this.state.devEUIDisabled}
                  value={this.state.node.devEUI || ""}
                  onChange={this.onChange.bind(this, "devEUI")}
                />
              </FormGroup>

              <FormGroup className={classes.whitespace} row>
                <label className={classes.spacingTop} htmlFor="deviceProfileID">
                  Device-profile
                </label>
                <Dropdown
                  options={deviceProfileOptions}
                  value={this.state.node.deviceProfileID}
                  onChange={this.onSelectChange.bind(this, "deviceProfileID")}
                  required={true}
                />
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
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }
}

NodeForm = withStyles(styles)(NodeForm);
export default withRouter(NodeForm);
