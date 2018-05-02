import React, { Component } from "react";
import { Link } from "react-router-dom";

import SessionStore from "../../stores/SessionStore";
import GatewayNetworkStore from "../../stores/GatewayNetworkStore";
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
import Pagination from "../../components/Pagination";
import Popup from './../../components/Popup';
import DeleteIcon from "material-ui-icons/DeleteForever";
import gatewayNetworkStore from "../../stores/GatewayNetworkStore";

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

class GatewayNetworkRow extends Component {
  getTags() {}
  render() {
    let tags;
    !this.props.gatewaynetwork.gateways === undefined
      ? (tags = this.props.gatewaynetwork.gateways.map((gw, i) => gw.tag))
      : (tags = "");
    return (
      <TableRow>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.gatewaynetwork.organizationID
            }/gatewaynetwork/${this.props.gatewaynetwork.id}`}
          >
            {this.props.gatewaynetwork.name}
          </Link>
        </TableCell>
        <TableCell>{tags}</TableCell>
        <TableCell>{this.props.gatewaynetwork.description}</TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.gatewaynetwork)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListGatewayNetworks extends Component {
  constructor() {
    super();

    this.state = {
      gatewaynetworks: [],
      pageSize: 5,
      pageNumber: 0,
      pages: 1,
      count: 0,
      isAdmin: false,
      popupOpen: false,
      deleteName: "",
      deleteGW: {}
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

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(props.match.params.organizationID)
    });

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    GatewayNetworkStore.getAll(
      size,
      (page - 1) * size,
      undefined,
      undefined,
      props.match.params.organizationID,
      (totalCount, gatewaynetworks) => {
        this.setState({
          gatewaynetworks: gatewaynetworks,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  onDelete(gatewaynetwork) {
    this.setState({
      popupOpen: true,
      deleteName: gatewaynetwork.name,
      deleteGW: gatewaynetwork
    });
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
    const emptyRows =
      pageSize - Math.min(pageSize, count - pageNumber * pageSize);

    const GatewayNetworkRows = this.state.gatewaynetworks.map((gwn, i) => (
      <GatewayNetworkRow 
        onDelete={this.onDelete}
        key={gwn.id} 
        gatewaynetwork={gwn} 
      />
    ));

    return (
      <div>
        <Popup
          open={this.state.popupOpen}
          description={'Are you sure you want to remove gateway network "' + this.state.deleteName + '" from organization?'}
          title='Remove Gateway Network'
          actionTitle='Remove'
          handleClose={() => {this.setState(prevState => ({popupOpen: !prevState.popupOpen}))}}
          action={() => {
              gatewayNetworkStore.deleteGatewayNetwork(
                this.state.deleteGW.id,
                responseData => {
                  this.setState({ popupOpen: false });
                  this.updatePage(this.props);
                }
              )
          }}
        />
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Name</TableCell>
                <TableCell>Tag(s)</TableCell>
                <TableCell>Description</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Link
                    to={`/dashboard/${
                      this.props.match.params.organizationID
                    }/gateway-networks/create`}
                    className={classes.noStyle}
                  >
                    <Button variant="raised">
                      <AddIcon />
                      Create gateway network
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {GatewayNetworkRows}
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

export default withStyles(styles)(ListGatewayNetworks);
