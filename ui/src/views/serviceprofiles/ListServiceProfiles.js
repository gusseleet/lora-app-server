import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableFooter
} from "material-ui/Table";
import Card from "material-ui/Card";
import AddIcon from "material-ui-icons/Add";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import DeleteIcon from "material-ui-icons/DeleteForever";
import ServiceProfileStore from "../../stores/ServiceProfileStore";
import SessionStore from "../../stores/SessionStore";
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

class ServiceProfileRow extends Component {
  render() {
    return (
      <TableRow>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.organizationID
            }/profiles/service-profiles/${
              this.props.serviceProfile.serviceProfileID
            }`}
          >
            {this.props.serviceProfile.name}
          </Link>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.serviceProfile)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListServiceProfiles extends Component {
  constructor() {
    super();

    this.state = {
      serviceProfiles: [],
      pageSize: 5,
      pageNumber: 0,
      pages: 1,
      count: 0,
      isAdmin: false,
      organizationID: -1,
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
        isAdmin: SessionStore.isAdmin()
      });
    });

    SessionStore.getOrganizationID();
  }

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin: SessionStore.isAdmin()
    });

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    ServiceProfileStore.getAllForOrganizationID(
      props.organizationID,
      size,
      (page - 1) * size,
      (totalCount, serviceProfiles) => {
        this.setState({
          serviceProfiles: serviceProfiles,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  onDelete(serviceProfile) {
    this.setState({
      popupOpen: true,
      deleteID: serviceProfile.serviceProfileID,
      deleteName: serviceProfile.name
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
    
    const ServiceProfileRows = this.state.serviceProfiles.map(
      (serviceProfile, i) => (
        <ServiceProfileRow
          onDelete={this.onDelete}
          key={serviceProfile.serviceProfileID}
          serviceProfile={serviceProfile}
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
            '" service-profile?'
          }
          title="Delete Service-Profile"
          actionTitle="Delete"
          action={() => {
            ServiceProfileStore.deleteServiceProfile(
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
                    }/profiles/create-service-profile`}
                    className={classes.noStyle}
                  >
                    <Button className={classes.button} variant="raised">
                      <AddIcon />
                      Create Service Profile
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ServiceProfileRows}
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

export default withStyles(styles)(ListServiceProfiles);
