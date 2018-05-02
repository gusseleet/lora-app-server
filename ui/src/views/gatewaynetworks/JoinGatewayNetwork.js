import React, { Component } from "react";
import { Link } from "react-router-dom";

import SessionStore from "../../stores/SessionStore";
import Card from "material-ui/Card";
import { withStyles } from "material-ui/styles";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableFooter
} from "material-ui/Table";
import Pagination from "../../components/Pagination";
import gatewayNetworkStore from "../../stores/GatewayNetworkStore";
import SearchField from "../../components/SearchField";

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
  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  search: {
    marginTop: 30,
    marginBottom: 8,
  }
});

class GatewayNetworkRow extends Component {
  constructor() {
    super();

    this.state = {
    };
  }

  render() {
    const { gatewayNetwork } = this.props;
    
    return (
      <TableRow>
        <TableCell>
          <Link
            to={`/dashboard/${
              gatewayNetwork.organizationID
            }/gatewaynetwork/${this.props}`}
          >
            {gatewayNetwork.name}
          </Link>
        </TableCell>
        <TableCell>{gatewayNetwork.organizationID}</TableCell>
        <TableCell>{'[Karlskrona, Ronneby, Karlshamn]'}</TableCell>
        <TableCell>{gatewayNetwork.description}</TableCell>
        <TableCell>{26}</TableCell>
        <TableCell>{500}</TableCell>
        <TableCell>{5}</TableCell>
      </TableRow>
    );
  }
}

class ListJoinGatewayNetworks extends Component {
  constructor() {
    super();

    this.state = {
      gatewayNetworks: [],
      pageSize: 5,
      pageNumber: 0,
      pages: 1,
      count: 0,
      isAdmin: false,
      search: ""
    };

    this.updatePage = this.updatePage.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    
    // Fetch active OrganizationID to see wether user has created an organization
    const organizationID = SessionStore.getOrganizationID();
    if (!isNaN(parseInt(organizationID, 10))) {
      this.props.history.push("/organizations");
    } else {
      const allOrgs = SessionStore.getOrganizations();
      if (allOrgs.length < 1) {
        this.props.history.push("/organizations");
      }
    }
    
    this.updatePage(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(props.organizationID)
    });

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");
    
    gatewayNetworkStore.getAll(
      size,
      (page - 1) * size,
      this.state.search,
      1,
      undefined,
      (totalCount, gatewayNetworks) => {
        this.setState({
          gatewayNetworks: gatewayNetworks,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
      }
    );
    window.scrollTo(0, 0); 
  }

  onChange(e) {
    this.setState({
      search: e.target.value
    });

    if(this.state.search && this.state.search.length > 1) {
      if(this.state.search.length % 2 === 0) {
        this.updatePage(this.props);
      }
    }

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
   
    const GatewayNetworkRows = this.state.gatewayNetworks.map((gwn, i) => (
      <GatewayNetworkRow key={gwn.id} gatewayNetwork={gwn} />
    ));

    return (
      <div className={classes.wrapper}>
        <div className={classes.search}>
          <SearchField 
            placeholder="Gateway Network Name"
            onChange={event => this.onChange(event)}
            value={this.state.search || ""}
          />
        </div>
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Name</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Tag(s)</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={50}>Data amount/month</TableCell>
                <TableCell width={50}>Monthly cost</TableCell>
                <TableCell width={50}>Gateways available</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {GatewayNetworkRows}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <Pagination
                  colSpan={7}
                  count={this.state.count}
                  rowsPerPage={this.state.pageSize}
                  page={this.state.pageNumber}
                  pathname="/join-a-network"
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

export default withStyles(styles)(ListJoinGatewayNetworks);
