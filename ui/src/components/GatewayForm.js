import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { withStyles } from "material-ui/styles";

import { Map, Marker, TileLayer } from 'react-leaflet';

import SessionStore from "../stores/SessionStore";
import LocationStore from "../stores/LocationStore";
import GatewayStore from "../stores/GatewayStore";
import NetworkServerStore from "../stores/NetworkServerStore";

import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import Typography from "material-ui/Typography";
import Checkbox from "material-ui/Checkbox";
import Button from "material-ui/Button";
import Dropdown from './Dropdown';

const styles = theme => ({
  textField: {
    width: 200,
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
    height:300,
  }
});

class GatewayForm extends Component {
  constructor() {
    super();

    this.state = {
      gateway: {},
      mapZoom: 15,
      update: false,
      channelConfigurations: [],
      networkServers: [],
      networkServerID: -1,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.updateZoom = this.updateZoom.bind(this);
    this.setToCurrentPosition = this.setToCurrentPosition.bind(this);
    this.handleSetToCurrentPosition = this.handleSetToCurrentPosition.bind(this);
  }

  onSelectChange(field, event) {
    let gateway = this.state.gateway;
    if (event.target != null) {
      gateway[field] = event.target.value;
    } else {
      gateway[field] = null;
    }

    if (field === "networkServerID" && gateway.networkServerID !== null) {
      GatewayStore.getAllChannelConfigurations(gateway.networkServerID, (configurations) => {
        this.setState({
          channelConfigurations: configurations,
        });
      });
    }

    this.setState({
      gateway: gateway,
    });
  }

  onChange(field, e) {
    let gateway = this.state.gateway;

    if (e.target.type === "number") {
      gateway[field] = parseFloat(e.target.value);
    } else if (e.target.type === "checkbox") {
      gateway[field] = e.target.checked;
    } else {
      gateway[field] = e.target.value;
    }

    this.setState({
      gateway: gateway,
    });
  }

  updatePosition() {
    const position = this.refs.marker.leafletElement.getLatLng();
    let gateway = this.state.gateway;
    gateway.latitude = position.lat;
    gateway.longitude = position.lng;
    this.setState({
      gateway: gateway,
    });
  }

  updateZoom(e) {
    this.setState({
      mapZoom: e.target.getZoom(),
    });
  }

  componentDidMount() {
    this.setState({
      gateway: this.props.gateway,
      isGlobalAdmin: SessionStore.isAdmin(),
    });

    if (!this.props.update) {
      this.setToCurrentPosition(false);
    }

    NetworkServerStore.getAllForOrganizationID(this.props.organizationID, 9999, 0, (totalCount, networkServers) => {
      this.setState({
        networkServers: networkServers,
      });
    });

    if (this.props.gateway.networkServerID !== undefined) {
      GatewayStore.getAllChannelConfigurations(this.props.gateway.networkServerID, (configurations) => {
        this.setState({
          channelConfigurations: configurations,
        });
      });
    }
  }

  setToCurrentPosition(overwrite) {
    LocationStore.getLocation((position) => {
      if (overwrite === true || typeof(this.state.gateway.latitude) === "undefined" || typeof(this.state.gateway.longitude) === "undefined" || this.state.gateway.latitude === 0 || this.state.gateway.longitude === 0) {
        let gateway = this.state.gateway;
        gateway.latitude = position.coords.latitude;
        gateway.longitude = position.coords.longitude;
        this.setState({
          gateway: gateway,
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      gateway: nextProps.gateway,
      update: typeof nextProps.gateway.mac !== "undefined",
    });

    if (this.props.gateway.networkServerID !== undefined) {
      GatewayStore.getAllChannelConfigurations(nextProps.gateway.networkServerID, (configurations) => {
        this.setState({
          channelConfigurations: configurations,
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.gateway);
  }

  handleSetToCurrentPosition(e) {
    e.preventDefault();
    this.setToCurrentPosition(true);
  }

  render() {
    const { classes } = this.props;

    let position = [];

    if (typeof(this.state.gateway.latitude) !== "undefined" || typeof(this.state.gateway.longitude) !== "undefined") {
      position = [this.state.gateway.latitude, this.state.gateway.longitude];
    } else {
      position = [0,0];
    }

    const channelConfigurations = this.state.channelConfigurations.map((c, i) => {
      return {
        value: c.id,
        label: c.name,
      };
    });

    const networkServerOptions = this.state.networkServers.map((n, i) => {
      return {
        value: n.id,
        label: n.name,
      };
    });

    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="headline">{this.props.formName}</Typography>
              <FormGroup row>
                <TextField
                  id="name"
                  label="Gateway name"
                  className={classes.textField}
                  placeholder="e.g. 'rooftop-gateway'"
                  required
                  value={this.state.gateway.name || ''}
                  pattern="[\w-]+"
                  onChange={this.onChange.bind(this, 'name')}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                The name may only contain words, numbers and dashes.
              </Typography>
              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="description"
                  label="Gateway description"
                  className={classes.multiline}
                  multiline
                  rows="4"
                  placeholder="An optional note about the gateway..."
                  value={this.state.gateway.description || ''}
                  onChange={this.onChange.bind(this, 'description')}
                />
              </FormGroup>
              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="mac"
                  label="MAC address"
                  className={classes.textField}
                  placeholder="0000000000000000"
                  pattern="[A-Fa-f0-9]{16}"
                  required
                  disabled={this.state.update}
                  value={this.state.gateway.mac || ''}
                  onChange={this.onChange.bind(this, 'mac')}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                Enter the gateway MAC address as configured in the packet-forwarder configuration on the gateway.
              </Typography>
              <FormGroup row>
                <label className={classes.spacingTop} htmlFor="networkServerID">Network-server</label>
                <Dropdown
                  value={this.state.gateway.networkServerID}
                  options={networkServerOptions}
                  onChange={this.onSelectChange.bind(this, "networkServerID")}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                Select the network-server to which the gateway will connect. When no network-servers are available in the dropdown, make sure a service-profile exists for this organization.
              </Typography>
              <FormGroup row>
                <label className={classes.spacingTop} htmlFor="channelConfigurationID">Channel-configuration</label>
                <Dropdown
                  value={this.state.gateway.name}
                  options={channelConfigurations}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                An optional channel-configuration can be assigned to a gateway. This configuration can be used to automatically re-configure the gateway (in the future).
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!this.state.gateway.ping}
                      onChange={this.onChange.bind(this, 'ping')}
                      value="ping"
                    />
                  }
                  label="Discovery enabled"
                  className={classes.spacingTop}
                />
                <Typography component="p" className={classes.helpBox}>
                  When enabled (and LoRa App Server is configured with the gateway discover feature enabled), the gateway will send out periodical pings to test its coverage by other gateways in the same network.
                </Typography>
              </FormGroup>
              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="altitude"
                  label="Gateway altitude (meters)"
                  className={classes.textField}
                  type="number"
                  value={this.state.gateway.altitude || 0}
                  onChange={this.onChange.bind(this, 'altitude')}
                />
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                When the gateway has an on-board GPS, this value will be set automatically when the network received statistics from the gateway.
              </Typography>
              <FormGroup className={classes.spacingTop} row>
                <Typography component="p">
                  Gateway location (<Link onClick={this.handleSetToCurrentPosition} to="#getLocation">set to current location</Link>)
                </Typography>
              </FormGroup>
              <FormGroup row>
                <Map
                  zoom={this.state.mapZoom}
                  center={position}
                  className={classes.mapStyle}
                  animate={true}
                  onZoomend={this.updateZoom}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url='//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position} draggable={true} onDragend={this.updatePosition} ref="marker" />
                </Map>
              </FormGroup>
              <Typography component="p" className={classes.helpBox}>
                Drag the marker to the location of the gateway. When the gateway has an on-board GPS, this value will be set automatically when the network receives statistics from the gateway.
              </Typography>


          <hr />
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
GatewayForm = withStyles(styles)(GatewayForm);
export default withRouter(GatewayForm);
