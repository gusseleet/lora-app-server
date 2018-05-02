import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import moment from "moment";
import L from 'leaflet';
import { Map, Marker, TileLayer, Polyline, Popup, MapControl } from 'react-leaflet';
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import LoadingGif from "../../images/loading.gif";

import GatewayStore from "../../stores/GatewayStore";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 770,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden",
    flex: 1,
    flexDirection: 'column'
  },
  wrapper: {
    maxWidth: 1280,
    width: "100%",
    margin: "auto"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  hidden: {
    display: "none"
  },
  map: {
    height: 700,
    marginTop: 20
  },
  loading: {
    margin: "auto",
    width: 100,
  },
  loadingWrapper: {
    margin: "auto",
  },
  infoText: {
    margin: "auto",
  }
});


class GatewayPing extends Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    GatewayStore.getGateway(this.props.match.params.mac, (gateway) => {
      this.setState({
        gateway: gateway,
      })
    });

    GatewayStore.getLastPing(this.props.match.params.mac, (ping) => {
      this.setState({
        ping: ping,
      });
    });
  }

  getColor(dbm) {
    if (dbm >= -100) {
      return "#FF0000";
    } else if (dbm >= -105) {
      return "#FF7F00";
    } else if (dbm >= -110) {
      return "#FFFF00";
    } else if (dbm >= -115) {
      return "#00FF00";
    } else if (dbm >= -120) {
      return "#00FFFF";
    } 
    return "#0000FF";
  }

  render() {
    const { classes } = this.props;
    setTimeout(()=>{
      this.setState({
        loading: false
      });
    }, 2000);
    if (!this.state.gateway || !this.state.ping || !this.state.ping.pingRX || this.state.ping.pingRX.length === 0) {
      return(
        <div className={classes.wrapper}>
          <Card className={classes.card}>
            <CardContent className={`${this.state.loading ? classes.loadingWrapper : classes.hidden}`}>
              <img className={classes.loading} src={LoadingGif} alt="Not found" />
            </CardContent>
            <CardContent className={`${this.state.loading ? classes.hidden : classes.infoText}`}>
              No gateway ping data available (yet). This could mean:

              <ul>
                <li>no ping was emitted yet</li>
                <li>the gateway ping feature has been disabled in LoRa App Server</li>
                <li>the ping was not received by any other gateways</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      );
    }

    const lastPingTimestamp = moment(this.state.ping.createdAt).fromNow();

    let bounds = [];
    let markers = [];
    let lines = [];

    const gwPos = [this.state.gateway.latitude, this.state.gateway.longitude];
    markers.push(<Marker position={gwPos} key={"gw" + this.state.gateway.mac}>
      <Popup>
        <span>
          {this.state.gateway.mac}<br />
          Freq: {this.state.ping.frequency/1000000} MHz<br />
          DR: {this.state.ping.dr}<br />
          Altitude: {this.state.gateway.altitude} meter(s)
        </span>
      </Popup>
    </Marker>);

    bounds.push(gwPos);

    for (let rx of this.state.ping.pingRX) {
      const pingPos = [rx.latitude, rx.longitude];

      markers.push(<Marker position={pingPos} key={"ping" + rx.mac}>
        <Popup>
          <span>
            {rx.mac}<br />
            RSSI: {rx.rssi} dBm<br />
            SNR: {rx.loraSNR} dB<br />
            Altitude: {rx.altitude} meter(s)
          </span>
        </Popup>
      </Marker>);
      bounds.push(pingPos);


      lines.push(<Polyline key={"line" + rx.mac} positions={[gwPos, pingPos]} color={this.getColor(rx.rssi)} opacity="0.7" weight="3" />);
    }


    return(
      <div className={classes.wrapper}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="title">Last ping: {lastPingTimestamp}</Typography>
            <Map animate={true} className={classes.map} maxZoom={19} scrollWheelZoom={false} bounds={bounds}>
              <TileLayer
                url='//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {markers}
              {lines}
              <LegendControl className="map-legend">
                <ul>
                  <li><span className="label" style={{background: this.getColor(-100)}}>&nbsp;</span> &gt;= -100 dBm</li>
                  <li><span className="label" style={{background: this.getColor(-105)}}>&nbsp;</span> &gt;= -105 dBm</li>
                  <li><span className="label" style={{background: this.getColor(-110)}}>&nbsp;</span> &gt;= -110 dBm</li>
                  <li><span className="label" style={{background: this.getColor(-115)}}>&nbsp;</span> &gt;= -115 dBm</li>
                  <li><span className="label" style={{background: this.getColor(-120)}}>&nbsp;</span> &gt;= -120 dBm</li>
                  <li><span className="label" style={{background: this.getColor(-121)}}>&nbsp;</span> &lt; -120 dBm</li>
                </ul>
              </LegendControl>
            </Map>
          </CardContent>
        </Card>
      </div>
    );
  }
}

class LegendControl extends MapControl {
  componentWillMount() {
    const legend = L.control({position: "bottomleft"});
    const jsx = (
      <div {...this.props}>
        {this.props.children}
      </div>
    );

    legend.onAdd = function(map) {
      let div = L.DomUtil.create("div", '');
      ReactDOM.render(jsx, div);
      return div;
    };

    this.leafletElement = legend;
  }
}

export default withStyles(styles)(GatewayPing);