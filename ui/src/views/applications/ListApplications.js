import React, { Component } from "react";
import { Link } from "react-router-dom";

import ApplicationStore from "../../stores/ApplicationStore";
import SessionStore from "../../stores/SessionStore";
import OrganizationStore from "../../stores/OrganizationStore";
import DeleteIcon from "material-ui-icons/DeleteForever";
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
  button: {
    paddingLeft: 6
  },
  buttonHolder: {
    marginTop: 30
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

class ApplicationRow extends Component {
  render() {
    return (
      <TableRow hover>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.application.organizationID
            }/applications/${this.props.application.id}/devices`}
          >
            {this.props.application.name}
          </Link>
        </TableCell>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.application.organizationID
            }/profiles/service-profiles/${
              this.props.application.serviceProfileID
            }`}
          >
            {this.props.application.serviceProfileName}
          </Link>
        </TableCell>
        <TableCell>{this.props.application.description}</TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.application)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListApplications extends Component {
  constructor() {
    super();

    this.state = {
      pageSize: 5,
      applications: [],
      organization: {},
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
          SessionStore.isOrganizationAdmin(
            this.props.match.params.organizationID
          )
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  onDelete(app) {
    this.setState({
      popupOpen: true,
      deleteID: app.id,
      deleteName: app.name
    });
  }

  updatePage(props, pageSize = undefined) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(props.match.params.organizationID)
    });

    OrganizationStore.getOrganization(
      props.match.params.organizationID,
      org => {
        this.setState({
          organization: org
        });
      }
    );

    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    ApplicationStore.getAllForOrganization(
      props.match.params.organizationID,
      size,
      (page - 1) * size,
      (totalCount, applications) => {
        this.setState({
          applications: applications,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
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

    const ApplicationRows = this.state.applications.map((application, i) => (
      <ApplicationRow
        onDelete={this.onDelete}
        key={application.id}
        application={application}
      />
    ));

    return (
      <div className={classes.wrapper}>
        <Popup
          open={this.state.popupOpen}
          description={
            'Are you sure you want to delete "' +
            this.state.deleteName +
            '" application?'
          }
          title="Delete Application"
          actionTitle="Delete"
          action={() => {
            ApplicationStore.deleteApplication(
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
                <TableCell>Service-profile</TableCell>
                <TableCell>Description</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Link
                    to={`/dashboard/${
                      this.props.match.params.organizationID
                    }/applications/create`}
                    className={classes.noStyle}
                  >
                    <Button className={classes.button} variant="raised">
                      <AddIcon />
                      Create Application
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ApplicationRows}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <Pagination
                  colSpan={4}
                  count={this.state.count}
                  rowsPerPage={this.state.pageSize}
                  page={this.state.pageNumber}
                  pathname={`/dashboard/${this.state.organization.id}/applications`}
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

export default withStyles(styles)(ListApplications);
