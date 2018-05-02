import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import  { InputLabel } from 'material-ui/Input';
import Typography from "material-ui/Typography";
import Checkbox from "material-ui/Checkbox";
import { withStyles } from "material-ui/styles";

import Loaded from "./Loaded.js";
import NetworkServerStore from "../stores/NetworkServerStore";
import SessionStore from "../stores/SessionStore";
import Dropdown from './Dropdown.js';

const styles = theme => ({
  textField: {
    width: 250
  },
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
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

class ServiceProfileForm extends Component {
  constructor() {
    super();

    this.state = {
      serviceProfile: {
        serviceProfile: {}
      },
      networkServers: [],
      update: false,
      isAdmin: false,
      loaded: {
        networkServers: false
      }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onNetworkServerChange = this.onNetworkServerChange.bind(this);
  }

  componentDidMount() {
    // TODO: Remove admin & Set Networkserver
    if (SessionStore.isAdmin()) {
      NetworkServerStore.getAll(9999, 0, (totalCount, networkServers) => {
        this.setState({
          serviceProfile: this.props.serviceProfile,
          networkServers: networkServers,
          isAdmin: true,
          loaded: {
            networkServers: true
          }
        });
      });
    } else {
      NetworkServerStore.getAllForOrganizationID(
        this.props.organizationID,
        9999,
        0,
        (totalCount, networkServers) => {
          this.setState({
            serviceProfile: this.props.serviceProfile,
            networkServers: networkServers,
            isAdmin: false,
            loaded: {
              networkServers: true
            }
          });
        }
      );
    }

    SessionStore.on("change", () => {
      this.setState({
        isAdmin: SessionStore.isAdmin()
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      serviceProfile: nextProps.serviceProfile,
      update:
        nextProps.serviceProfile.serviceProfile.serviceProfileID !== undefined
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.serviceProfile);
  }

  onChange(fieldLookup, e) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length - 1];
    lookup.pop(); // remove last item

    let serviceProfile = this.state.serviceProfile;
    let obj = serviceProfile;

    for (const f of lookup) {
      obj = obj[f];
    }

    if (e.target.type === "number") {
      obj[fieldName] = parseInt(e.target.value, 10);
    } else if (e.target.type === "checkbox") {
      obj[fieldName] = e.target.checked;
    } else {
      obj[fieldName] = e.target.value;
    }

    this.setState({
      serviceProfile: serviceProfile
    });
  }

  onSelectChange(fieldLookup, event) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length-1];
    lookup.pop(); // remove last item

    let serviceProfile = this.state.serviceProfile;
    let obj = serviceProfile;

    for (const f of lookup) {
      obj = obj[f];
    }

    obj[fieldName] = event.target.value;

    this.setState({
      serviceProfile: serviceProfile,
    });
  }

  onNetworkServerChange(val) {
    let serviceProfile = this.state.serviceProfile;
    if (val != null) {
      serviceProfile.networkServerID = val.value;
    } else {
      serviceProfile.networkServerID = null;
    }
    this.setState({
      serviceProfile: serviceProfile
    });
  }

  render() {
    const { classes } = this.props;

    const networkServerOptions = this.state.networkServers.map((networkServer, i) => {
      return {
        value: networkServer.id,
        label: networkServer.name,
      };
    });

    return (
      <Loaded loaded={this.state.loaded}>
        <form onSubmit={this.handleSubmit}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="headline">{this.props.formName}</Typography>
              <TextField
                id="name"
                label="Service profile name"
                className={classes.textField}
                required
                value={this.state.serviceProfile.name || ""}
                onChange={this.onChange.bind(this, "name")}
                pattern="[\w-]+"
              />
              <Typography component="p" className={classes.helpBox}>
                A memorable name for the service profile.
              </Typography>
              
              <InputLabel htmlFor="networkServerID">Network-server</InputLabel>
              <Dropdown
                value={this.state.serviceProfile.networkServerID}
                options={networkServerOptions}
                type="number"
                onChange={this.onSelectChange.bind(this, "networkServerID")}
              />

              <Typography component="p" className={classes.helpBox}>
                Choose a Network Server
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      !!this.state.serviceProfile.serviceProfile.addGWMetadata
                    }
                    onChange={this.onChange.bind(
                      this,
                      "serviceProfile.addGWMetadata"
                    )}
                    value="addGwMetaData"
                  />
                }
                label="Add gateway meta-data"
              />
              <Typography component="p" className={classes.helpBox}>
                When checked, it means that organization administrators are able
                to add their own gateways to the network. Note that the usage of
                the gateways is not limited to this organization. GW metadata
                (RSSI, SNR, GW geoloc., etc.) are added to the packet sent to
                the application-server.
              </Typography>

              <TextField
                id="deviceStatusRequestFrenquency"
                label="Device-status request frequency"
                className={classes.textField}
                value={
                  this.state.serviceProfile.serviceProfile.devStatusReqFreq || 0
                }
                type="number"
                onChange={this.onChange.bind(
                  this,
                  "serviceProfile.devStatusReqFreq"
                )}
              />
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        !!this.state.serviceProfile.serviceProfile
                          .reportDevStatusBattery
                      }
                      onChange={this.onChange.bind(
                        this,
                        "serviceProfile.reportDevStatusBattery"
                      )}
                      value="reportBatteryLevel"
                    />
                  }
                  label="Report battery level"
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                Report End-Device battery level to application-server.
              </Typography>

              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        !!this.state.serviceProfile.serviceProfile
                          .reportDevStatusMargin
                      }
                      onChange={this.onChange.bind(
                        this,
                        "serviceProfile.reportDevStatusMargin"
                      )}
                      value="reportDevStatusMargin"
                    />
                  }
                  label="Report margin"
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                Report End-Device margin to application-server.
              </Typography>

              <TextField
                id="drMin"
                label="Minimum allowed data-rate"
                className={classes.textField}
                type="number"
                value={this.state.serviceProfile.serviceProfile.drMin || 0}
                onChange={this.onChange.bind(this, "serviceProfile.drMin")}
              />
              <Typography component="p" className={classes.helpBox}>
                Minimum allowed data rate. Used for ADR.
              </Typography>

              <TextField
                id="drMax"
                label="Maximum allowed data-rate"
                className={classes.textField}
                type="number"
                required
                value={this.state.serviceProfile.serviceProfile.drMax || 0}
                onChange={this.onChange.bind(this, "serviceProfile.drMax")}
              />
              <Typography component="p" className={classes.helpBox}>
                Maximum allowed data rate. Used for ADR.
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
      </Loaded>
    );
  }
}

ServiceProfileForm = withStyles(styles)(ServiceProfileForm);
export default withRouter(ServiceProfileForm);
