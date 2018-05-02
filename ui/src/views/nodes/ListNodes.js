import React, { Component } from "react";
import moment from "moment";
import { Link } from "react-router-dom";

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
import NodeStore from "../../stores/NodeStore";
import SessionStore from "../../stores/SessionStore";
import ApplicationStore from "../../stores/ApplicationStore";
import Popup from "../../components/Popup";
import Pagination from "../../components/Pagination";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
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
  button: {
    marginTop: 30
  },
  wrapper: {
    width: "100%",  
    maxWidth: 1280,
    margin: "auto"
  },
  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  }
});

class NodeRow extends Component {
  render() {
    let lastseen = "";
    let margin = "n/a";
    let battery = "n/a";
    if (this.props.node.lastSeenAt !== undefined) {
      lastseen = moment(this.props.node.lastSeenAt).fromNow();
    }

    if (
      this.props.node.deviceStatusMargin !== undefined &&
      this.props.node.deviceStatusMargin !== 256
    ) {
      margin = `${this.props.node.deviceStatusMargin} dB`;
    }

    if (
      this.props.node.deviceStatusBattery !== undefined &&
      this.props.node.deviceStatusBattery !== 256
    ) {
      if (this.props.node.deviceStatusBattery === 255) {
        battery = "n/a";
      } else if (this.props.node.deviceStatusBattery === 0) {
        battery = "external";
      } else {
        battery =
          Math.round(100 / 255 * this.props.node.deviceStatusBattery) + " %";
      }
    }

    return (
      <TableRow>
        <TableCell>{lastseen}</TableCell>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.application.organizationID
            }/applications/${this.props.application.id}/devices/${
              this.props.node.devEUI
            }/edit`}
          >
            {this.props.node.name}
          </Link>
        </TableCell>
        <TableCell>{this.props.node.devEUI}</TableCell>
        <TableCell>
          <Link
            to={`/dashboard/${this.props.application.organizationID}/profiles/device-profiles/${
              this.props.node.deviceProfileID
            }`}
          >
            {this.props.node.deviceProfileName}
          </Link>
        </TableCell>
        <TableCell>{margin}</TableCell>
        <TableCell>{battery}</TableCell>
        <TableCell style={{ textAlign: "right"}}>
        <DeleteIcon
          onClick={() => this.props.onDelete(this.props.node, this.props.application)}
          color="secondary"
          style={{cursor: "pointer"}}
        />
        </TableCell>
      </TableRow>
    );
  }
}

class ListNodes extends Component {
  constructor() {
    super();
    this.state = {
      application: {},
      nodes: [],
      isAdmin: false,
      pageSize: 5,
      pageNumber: 0,
      pages: 1,
      count: 0,
      search: "",
      popupOpen: false,
      deleteID: -1,
      deleteName: ""
    };

    this.updatePage = this.updatePage.bind(this);
    this.onChange = this.onChange.bind(this);
    this.searchNodes = this.searchNodes.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    this.updatePage(this.props);
    ApplicationStore.getApplication(
      this.props.match.params.applicationID,
      application => {
        this.setState({ application: application });
      }
    );

    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(this.props.match.params.organizationID)
    });

    SessionStore.on("change", () => {
      this.setState({
        isAdmin:
          SessionStore.isAdmin() ||
          SessionStore.isOrganizationAdmin(
            this.props.match.params.organizationID
          )
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  updatePage(props, pageSize = undefined) {
    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    NodeStore.getAll(
      this.props.match.params.applicationID,
      size,
      (page - 1) * size,
      this.state.search,
      (totalCount, nodes) => {
        this.setState({
          nodes: nodes,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  onChange(e) {
    this.setState({
      search: e.target.value
    });
  }

  onDelete(node, application) {
    this.setState({
      popupOpen: true,
      deleteID: node.devEUI,
      deleteName: node.name,
      deleteApplicationId: application.applicationID
    });
  }

  searchNodes(e) {
    e.preventDefault();
    this.updatePage(this.props);
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
    
    const NodeRows = this.state.nodes.map((node, i) => (
      <NodeRow
        key={node.devEUI}
        node={node}
        application={this.state.application}
        onDelete={this.onDelete}
      />
    ));

    const searchStyle = {
      width: "200px"
    };

    return (
      <div className={classes.wrapper}>
        <div className={classes.button}>
          <Popup
            open={this.state.popupOpen}
            description={
              'Are you sure you want to delete "' +
              this.state.deleteName +
              '" this device?'
            }
            title="Delete Device"
            actionTitle="Delete"
            action={() => {
              NodeStore.deleteNode(
                this.state.deleteApplicationId,
                this.state.deleteID,
                responseData => {
                  this.setState({ popupOpen: false });
                  this.updatePage(this.props);
                }
              );
            }}
          />
          
        </div>
        <form onSubmit={this.searchNodes}>
          <div className="input-group-addon">
            <span className="glyphicon glyphicon-search" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="form-control"
            style={searchStyle}
            placeholder="Device name or DevEUI"
            onChange={this.onChange}
            value={this.state.search || ""}
          />
        </form>
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Last seen</TableCell>
                <TableCell>Device name</TableCell>
                <TableCell>Device EUI</TableCell>
                <TableCell>Device-profile</TableCell>
                <TableCell>Link margin</TableCell>
                <TableCell>Battery</TableCell>
                <TableCell style={{ textAlign: "right"}}>
                    <Link
                      to={`/dashboard/${
                        this.props.match.params.organizationID
                      }/applications/${
                        this.props.match.params.applicationID
                      }/devices/create`}
                      className={classes.noStyle}
                      >
                      <Button variant="raised">
                        <AddIcon />
                        Create Device
                      </Button>
                    </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {NodeRows}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
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
                  pathname={`dashboard/${this.props.organizationID}/
                  applications/${this.state.application.id}/devices`}
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

export default withStyles(styles)(ListNodes);
