import React, { Component } from "react";
import { Link } from "react-router-dom";

import moment from "moment";
import { Bar } from "react-chartjs";

import GatewayStore from "../../stores/GatewayStore";
import SessionStore from "../../stores/SessionStore";

import Card from "material-ui/Card";
import AddIcon from "material-ui-icons/Add";
import { withStyles } from "material-ui/styles";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableFooter
} from "material-ui/Table";
import Button from "material-ui/Button";
import DeleteIcon from "material-ui-icons/DeleteForever";
import Popup from "../../components/Popup";
import Pagination from "../../components/Pagination";

const styles = theme => ({
  card: {
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
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
  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  }
});

class GatewayRow extends Component {
  constructor() {
    super();

    this.state = {
      stats: {
        labels: [],
        datasets: [
          {
            data: [],
            fillColor: "rgba(33, 150, 243, 1)"
          }
        ]
      },
      options: {
        animation: false,
        showScale: false,
        showTooltips: false,
        barShowStroke: false,
        barValueSpacing: 5
      }
    };
  }

  componentWillMount() {
    GatewayStore.getGatewayStats(
      this.props.gateway.mac,
      "DAY",
      moment()
        .subtract(29, "days")
        .toISOString(),
      moment().toISOString(),
      records => {
        let stats = this.state.stats;
        for (const record of records) {
          stats.labels.push(record.timestamp);
          stats.datasets[0].data.push(
            record.rxPacketsReceived + record.txPacketsReceived
          );
        }

        this.setState({
          stats: stats
        });
      }
    );
  }

  render() {
    return (
      <TableRow>
        <TableCell>
          <Link
            to={`/dashboard/${this.props.gateway.organizationID}/gateways/${
              this.props.gateway.mac
            }`}
          >
            {this.props.gateway.name}
          </Link>
        </TableCell>
        <TableCell>{this.props.gateway.mac}</TableCell>
        <TableCell>
          <Bar
            width="380"
            height="23"
            data={this.state.stats}
            options={this.state.options}
          />
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.gateway)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListGateways extends Component {
  constructor() {
    super();

    this.state = {
      gateways: [],
      pageSize: 5,
      pageNumber: 0,
      pages: 1,
      count: 0,
      isAdmin: false,
      popupOpen: false,
      deleteID: -1,
      deleteName: ""
    };

    this.updatePage = this.updatePage.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    this.updatePage(this.props);

    SessionStore.on("change", () => {
      this.setState({
        isAdmin:
          SessionStore.isAdmin() ||
          SessionStore.isOrganizationAdmin(this.props.match.params.organizationID)
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  onDelete(gateway) {
    this.setState({
      popupOpen: true,
      deleteID: gateway.mac,
      deleteName: gateway.name
    });
  }

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(props.match.params.organizationID)
    });

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    GatewayStore.getAllForOrganization(
      props.match.params.organizationID,
      size,
      (page - 1) * size,
      (totalCount, gateways) => {
        this.setState({
          gateways: gateways,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
      }
    );
    window.scrollTo(0, 0);
  }

  onChangeRowsPerPage = event => {
    this.setState({
      pageSize: event.target.value
    });
    this.updatePage(this.props, event.target.value);
  };

  render() {
    const { classes } = this.props;
    const { pageSize, count, pageNumber } = this.state;
    const emptyRows = pageSize - Math.min(pageSize, count - pageNumber * pageSize);

    const GatewayRows = this.state.gateways.map((gw, i) => (
      <GatewayRow onDelete={this.onDelete} key={gw.mac} gateway={gw} />
    ));

    return (
      <div className={classes.wrapper}>
        <Popup
          open={this.state.popupOpen}
          description={
            'Are you sure you want to delete "' +
            this.state.deleteName +
            '" gateway?'
          }
          title="Delete Gateway"
          actionTitle="Delete"
          action={() => {
            GatewayStore.deleteGateway(this.state.deleteID, responseData => {
              this.setState({ popupOpen: false });
              this.updatePage(this.props);
            });
          }}
        />
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Name</TableCell>
                <TableCell>MAC</TableCell>
                <TableCell>Gateway activity (30d)</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Link
                    to={`/dashboard/${this.props.match.params.organizationID}/gateways/create`}
                    className={classes.noStyle}
                  >
                    <Button variant="raised">
                      <AddIcon />
                      Create gateway
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {GatewayRows}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <Pagination
                  count={this.state.count}
                  rowsPerPage={this.state.pageSize}
                  page={this.state.pageNumber}
                  pathname={`/dashboard/${this.props.match.params.organizationID}/gateways`}
                  onChangeRowsPerPage={this.onChangeRowsPerPage.bind(this)}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(ListGateways);
