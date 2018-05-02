import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import TextField from 'material-ui/TextField';
import { withStyles } from "material-ui/styles";
import { InputLabel } from 'material-ui/Input';
import Card, { CardContent } from "material-ui/Card";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";

import Loaded from "./Loaded.js";
import NetworkServerStore from "../stores/NetworkServerStore";
import SessionStore from "../stores/SessionStore";
import Dropdown from './Dropdown.js';

const styles = theme => ({
  button: {
    paddingLeft: 6,
  },
  buttonHolder: {
    marginTop: 30,
    marginBottom: 30,
  },
  textField: {
    width: 250,
    display: "block",
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  },
});


class DeviceProfileForm extends Component {
  constructor() {
    super();

    this.state = {
      deviceProfile: {
        deviceProfile: {},
      },
      networkServers: [],
      update: false,
      activeTab: "general",
      isAdmin: false,
      loaded: {
        networkServers: false,
      },
      macVersion: "",

    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.changeTab = this.changeTab.bind(this);
  }

  componentDidMount() {
    NetworkServerStore.getAllForOrganizationID(this.props.organizationID, 9999, 0, (totalCount, networkServers) => {
      this.setState({
        deviceProfile: this.props.deviceProfile,
        networkServers: networkServers,
        isAdmin: SessionStore.isAdmin() || SessionStore.isOrganizationAdmin(this.props.organizationID),
        loaded: {
          networkServers: true,
        },
        showDropdown: true,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    let dp = nextProps.deviceProfile;
    if (dp.deviceProfile !== undefined && dp.deviceProfile.factoryPresetFreqs !== undefined && dp.deviceProfile.factoryPresetFreqs.length > 0) {
      dp.deviceProfile.factoryPresetFreqsStr = dp.deviceProfile.factoryPresetFreqs.join(', ');
    }

    this.setState({
      deviceProfile: dp,
      update: nextProps.deviceProfile.deviceProfile.deviceProfileID !== undefined,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.deviceProfile);
  }

  onChange(fieldLookup, e) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length-1];
    lookup.pop(); // remove last item

    let deviceProfile = this.state.deviceProfile;
    let obj = deviceProfile;

    for (const f of lookup) {
      obj = obj[f];
    }

    if (fieldName === "factoryPresetFreqsStr") {
      obj[fieldName] = e.target.value;

      if (e.target.value === "") {
        obj["factoryPresetFreqs"] = [];
      } else {
        let freqsStr = e.target.value.split(",");
        obj["factoryPresetFreqs"] = freqsStr.map((c, i) => parseInt(c, 10));
      }
    } else if (e.target.type === "number") {
      obj[fieldName] = parseInt(e.target.value, 10);
    } else if (e.target.type === "checkbox") {
      obj[fieldName] = e.target.checked;
    } else {
      obj[fieldName] = e.target.value;
    }

    this.setState({
      deviceProfile: deviceProfile,
    });
  }

  onSelectChange(fieldLookup, event) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length-1];
    lookup.pop(); // remove last item

    let deviceProfile = this.state.deviceProfile;
    let obj = deviceProfile;

    for (const f of lookup) {
      obj = obj[f];
    }

    obj[fieldName] = event.target.value;

    this.setState({
      deviceProfile: deviceProfile,
    });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  changeTab(e) {
    e.preventDefault();
    this.setState({
      activeTab: e.target.getAttribute("aria-controls"),
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

    const macVersionOptions = [
      {value: 100, label: "1.0.0"},
      {value: 101, label: "1.0.1"},
      {value: 102, label: "1.0.2"},
      {value: 110, label: "1.1.0"},
    ];

    const regParamsOptions = [
      {value: "A", label: "A"},
      {value: "B", label: "B"},
    ];

    return(
      <Loaded loaded={this.state.loaded}>
          <form onSubmit={this.handleSubmit}>
            <Card>
              <CardContent>
                <Typography variant="headline">{this.props.formName}</Typography>
                <TextField
                  id="name"
                  label="Device Name"
                  className={classes.textField}
                  required value={this.state.deviceProfile.name || ''}
                  onChange={this.onChange.bind(this, 'name')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                  A memorable name for the device-profile.
                </Typography>

                <InputLabel htmlFor="networkServerID">Network-server</InputLabel>
                <Dropdown
                  value={this.state.deviceProfile.networkServerID}
                  options={networkServerOptions}
                  type="number"
                  onChange={this.onSelectChange.bind(this, "networkServerID")}
                />
                <Typography component="p" className={classes.helpBox}>
                  The network-server on which this device-profile will be provisioned. After creating the device-profile, this value can't be changed.
                </Typography>

                <InputLabel htmlFor="macVersion">Mac Version </InputLabel>
                <Dropdown
                  value={this.state.macVersion}
                  options={macVersionOptions}
                  type="number"
                  onChange={this.handleChange("macVersion")}
                />
                <Typography component="p" className={classes.helpBox}>
                  Version of the LoRaWAN supported by the End-Device.
                </Typography>

                <InputLabel htmlFor="macVersion">LoRaWAN Regional Parameters revision</InputLabel>
                <Dropdown
                  value={this.state.deviceProfile.deviceProfile.regParamsRevision}
                  options={regParamsOptions}
                  type="number"
                  onChange={this.onSelectChange.bind(this, "deviceProfile.regParamsRevision")}
                />
                <Typography component="p" className={classes.helpBox}>
                  Revision of the Regional Parameters document supported by the End-Device.
                </Typography>

                <TextField
                  id="maxEIRP"
                  label="Max EIRP"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.maxEIRP  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.maxEIRP')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                Maximum EIRP supported by the End-Device.
                </Typography>
                <TextField
                  id="rxDelay1"
                  label="RX1 Delay"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.rxDelay1  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.rxDelay1')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                Class A RX1 delay (mandatory for ABP).
                </Typography>
                <TextField
                  id="rxDROffset1"
                  label="RX1 data-rate offset"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.rxDROffset1  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.rxDROffset1')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                RX1 data rate offset (mandatory for ABP).
                </Typography>
                <TextField
                  id="rxDataRate2"
                  label="RX2 data-rate"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.rxDataRate2  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.rxDataRate2')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                RX2 data rate (mandatory for ABP).
                </Typography>
                <TextField
                  id="rxFreq2"
                  label="RX2 channel frequency"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.rxFreq2  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.rxFreq2')}
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                RX2 channel frequency (mandatory for ABP).
                </Typography>
                <TextField
                  id="factoryPresetFreqsStr"
                  label="Factory-present frequencies"
                  className={classes.textField}
                  type="number"
                  required value={this.state.deviceProfile.deviceProfile.factoryPresetFreqsStr  || ''}
                  onChange={this.onChange.bind(this, 'deviceProfile.factoryPresetFreqsStr')}
                  placeholder="860100000, 868300000, 868500000"
                  pattern="[\w-]+"
                />
                <Typography component="p" className={classes.helpBox}>
                List of factory-preset frequencies (mandatory for ABP).
                </Typography>
                <div className={classes.buttonHolder}>
                  <Button type="submit" className={classes.button} variant="raised">
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

DeviceProfileForm = withStyles(styles)(DeviceProfileForm)
export default withRouter(DeviceProfileForm);
