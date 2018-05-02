import React, { Component } from 'react';
import moment from "moment";
import { Map, Marker, TileLayer } from 'react-leaflet';
import { Bar } from "react-chartjs";
import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";

import GatewayStore from "../../stores/GatewayStore";
import Divider from 'material-ui/Divider';

const styles = theme => ({
  card: {
    minHeight: 300,
    margin: "auto",
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  },
  cardContent: {
    flex: 1
  },
  wrapper: {
    maxWidth: 1280,
    width: "100%",
    margin: "auto"
  },
  map: {
    height: 450,
    width: 450
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  stats: {
    minWidth: 720,
    width: "100%",
  }
});


class GatewayStats extends Component {
  constructor() {
    super();

    this.state = {
      periodSelected: '30d',
      periods: {
        "hour": {
          interval: "MINUTE",
          substract: 59,
          substractInterval: 'minutes',
          format: "mm",
        },
        "1d": {
          interval: "HOUR",
          substract: 23,
          substractInterval: "hours",
          format: "HH",
        },
        "14d": {
          interval: "DAY",
          substract: 13,
          substractInterval: "days",
          format: "Do",
        },
        "30d": {
          interval: "DAY",
          substract: 29,
          substractInterval: "days",
          format: "Do",
        },
      },
      statsUp: {
        labels: [],
        datasets: [
          {
            label: "received for transmission",
            data: [],
            fillColor: "rgba(33, 150, 243, 0.25)",
          },
          {
            label: "emitted",
            data: [],
            fillColor: "rgba(33, 150, 243, 1)",
          },
        ],
      },
      statsDown: {
        labels: [],
        datasets: [
          {
            label: "total received",
            data: [],
            fillColor: "rgba(33, 150, 243, 0.25)",
          },
          {
            label: "received with valid CRC",
            data: [],
            fillColor: "rgba(33, 150, 243, 1)",
          },
        ],
      },
      statsOptions: {
        animation: true,
        barShowStroke: false,
        barValueSpacing: 4,
        responsive: true,
      },
    };

    this.updateStats = this.updateStats.bind(this);
  }

  componentWillMount() {
    this.updateStats(this.state.periodSelected);
  }

  updateStats(period) {
    GatewayStore.getGatewayStats(this.props.mac, this.state.periods[period].interval, moment().subtract(this.state.periods[period].substract, this.state.periods[period].substractInterval).toISOString(), moment().toISOString(), (records) => {
      let statsUp = this.state.statsUp;
      let statsDown = this.state.statsDown;

      statsUp.labels = [];
      statsDown.labels = [];
      statsUp.datasets[0].data = [];
      statsUp.datasets[1].data = [];
      statsDown.datasets[0].data = [];
      statsDown.datasets[1].data = [];

      for (const record of records) {
        statsUp.labels.push(moment(record.timestamp).format(this.state.periods[period].format));
        statsDown.labels.push(moment(record.timestamp).format(this.state.periods[period].format));
        statsUp.datasets[0].data.push(record.txPacketsReceived);
        statsUp.datasets[1].data.push(record.txPacketsEmitted);
        statsDown.datasets[0].data.push(record.rxPacketsReceived);
        statsDown.datasets[1].data.push(record.rxPacketsReceivedOK);
      }

      this.setState({
        statsUp: statsUp,
        statsDown: statsDown,
      });
    });
  }

  updatePeriod(p) {
    this.setState({
      periodSelected: p,
    });

    this.updateStats(p);
  }


  render() {
    return(
      <div style={{marginTop: 10}}>
        <Button onClick={this.updatePeriod.bind(this, 'hour')}>
         hour
        </Button>
        <Button onClick={this.updatePeriod.bind(this, '1d')}>
         1d
        </Button>
        <Button onClick={this.updatePeriod.bind(this, '14d')}>
         14d
        </Button>
        <Button onClick={this.updatePeriod.bind(this, '30d')}>
          30d
        </Button>

        <Typography variant="headline" style={{marginTop: 20}}>Frames sent per {this.state.periods[this.state.periodSelected].interval.toLowerCase()}</Typography>
        <Bar height="120" data={this.state.statsUp} options={this.state.statsOptions} redraw />
        <Divider />
        <Typography variant="headline">Frames received per {this.state.periods[this.state.periodSelected].interval.toLowerCase()}</Typography>
        <Bar height="120" data={this.state.statsDown} options={this.state.statsOptions} redraw />


      </div>
    );
  }
}

class GatewayDetails extends Component {
  constructor() {
    super();

    this.state = {
      gateway: {},
    }
  }

  componentWillMount() {
    GatewayStore.getGateway(this.props.match.params.mac, (gateway) => {
      this.setState({
        gateway: gateway,
      });
    });
  }

  render() {
    const { classes } = this.props;

    let lastseen = "";
    let position = [];

    if (typeof(this.state.gateway.latitude) !== "undefined" && typeof(this.state.gateway.longitude !== "undefined")) {
      position = [this.state.gateway.latitude, this.state.gateway.longitude];
    } else {
      position = [0,0];
    }

    if (typeof(this.state.gateway.lastSeenAt) !== "undefined" && this.state.gateway.lastSeenAt !== "") {
      lastseen = moment(this.state.gateway.lastSeenAt).fromNow();
    }

    return(
      <div className={classes.wrapper}>
          <Card className={classes.card} >
            <CardContent>
              <div className={classes.contentLeft}>
              <Table className={classes.table}>
                <TableHead>
                    <TableRow className={classes.tableHead}>
                      <TableCell><Typography variant="headline">{this.state.gateway.name}</Typography></TableCell>
                      <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>MAC</strong></TableCell>
                    <TableCell>{this.state.gateway.mac}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Altitude</strong></TableCell>
                    <TableCell>{this.state.gateway.altitude} meters</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>GPS coordinates</strong></TableCell>
                    <TableCell>{this.state.gateway.latitude}, {this.state.gateway.longitude}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Last seen (stats)</strong></TableCell>
                    <TableCell>{lastseen}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className={classes.contentRight}>
              <Map center={position} zoom={15} className={classes.map} animate={true} scrollWheelZoom={false}>
                <TileLayer
                  url='//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position} />
              </Map>
            </div>
          </CardContent>
          <CardContent>
            <div className={classes.stats}>
              <GatewayStats mac={this.props.match.params.mac} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}


export default withStyles(styles)(GatewayDetails);
