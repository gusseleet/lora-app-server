import React, { Component } from "react";
import { Link } from "react-router-dom";

import DeviceProfileStore from "../../stores/DeviceProfileStore";
import SessionStore from "../../stores/SessionStore";
import Card from "material-ui/Card";
import AddIcon from "material-ui-icons/Add";
import { withStyles } from "material-ui/styles";
import DeleteIcon from "material-ui-icons/DeleteForever";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableFooter
} from "material-ui/Table";
import Button from "material-ui/Button";
import Popup from "../../components/Popup";
import Pagination from "../../components/Pagination";

const styles = theme => ({
  card: {
    minHeight: 300,
    margin: "auto",
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  },
  button: {
    paddingLeft: 6
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

class DeviceProfileRow extends Component {
  render() {
    return (
      <TableRow hover>
        <TableCell>
          <Link
            to={`/dashboard/${this.props.organizationID}/profiles/device-profiles/${
              this.props.deviceProfile.deviceProfileID
            }`}
          >
            {this.props.deviceProfile.name}
          </Link>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.deviceProfile)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListDeviceProfiles extends Component {
  constructor() {
    super();

    this.state = {
      pageSize: 5,
      deviceProfiles: [],
      isAdmin: false,
      pageNumber: 0,
      pages: 1,
      count: 0,
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
          SessionStore.isOrganizationAdmin(this.props.organizationID)
      });
    });
  }

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(this.props.organizationID)
    });

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    DeviceProfileStore.getAllForOrganizationID(
      props.organizationID,
      size,
      (page - 1) * size,
      (totalCount, deviceProfiles) => {
        this.setState({
          deviceProfiles: deviceProfiles,
          pageNumber: page -1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  onDelete(deviceProfile) {
    this.setState({
      popupOpen: true,
      deleteID: deviceProfile.deviceProfileID,
      deleteName: deviceProfile.name
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
    const emptyRows = pageSize - Math.min(pageSize, count - pageNumber * pageSize);

    const DeviceProfileRows = this.state.deviceProfiles.map(
      (deviceProfile, i) => (
        <DeviceProfileRow
          onDelete={this.onDelete}
          key={deviceProfile.deviceProfileID}
          deviceProfile={deviceProfile}
          organizationID={this.props.organizationID}
        />
      )
    );

    return (
      <div className={classes.wrapper}>
        <Popup
          open={this.state.popupOpen}
          description={
            'Are you sure you want to delete "' +
            this.state.deleteName +
            '" device-profile?'
          }
          title="Delete Device-Profile"
          actionTitle="Delete"
          action={() => {
            DeviceProfileStore.deleteDeviceProfile(
              this.state.deleteID,
              responseData => {
                this.setState({ popupOpen: false });
                this.updatePage(this.props);
              }
            );
          }}
        />
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Name</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Link
                    to={`/dashboard/${
                      this.props.organizationID
                    }/profiles/create-device-profile`}
                    className={classes.noStyle}
                  >
                    <Button className={classes.button} variant="raised">
                      <AddIcon />
                      Create device-profile
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DeviceProfileRows}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <Pagination
                  colSpan={2}
                  count={this.state.count}
                  rowsPerPage={this.state.pageSize}
                  page={this.state.pageNumber}
                  pathname="/organizations"
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

export default withStyles(styles)(ListDeviceProfiles);
