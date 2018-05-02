import React, { Component } from "react";
import { Link } from "react-router-dom";
import OrganizationStore from "../../stores/OrganizationStore";
import SessionStore from "../../stores/SessionStore";
import Button from "material-ui/Button";
import PropTypes from "prop-types";
import Card from "material-ui/Card";
import AddIcon from "material-ui-icons/Add";
import DeleteIcon from "material-ui-icons/DeleteForever";
import { withStyles } from "material-ui/styles";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter
} from 'material-ui/Table';
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
  },
  red: {
    color: "red"
  }
});

class OrganizationRow extends Component {
  render() {
    return (
      <TableRow style={{ textDecorationLine: "none" }} hover>
        <TableCell>
          <Link to={`/organizations/${this.props.organization.id}`}>
            {this.props.organization.name}
          </Link>
        </TableCell>
        <TableCell>{this.props.organization.displayName}</TableCell>
        <TableCell>
          {this.props.organization.canHaveGateways ? "Yes" : "No"}
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.organization)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class ListOrganizations extends Component {
  constructor() {
    super();

    this.state = {
      pageSize: 5,
      organizations: [],
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

  onDelete(org) {
    this.setState({
      popupOpen: true,
      deleteID: org.id,
      deleteName: org.displayName
    });
  }

  componentDidMount() {
    this.updatePage(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  updatePage(props, pageSize = undefined) {
    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");

    OrganizationStore.getAll(
      "",
      size,
      (page - 1) * size,
      (totalCount, organizations) => {
        this.setState({
          organizations: organizations,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / size)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  componentWillMount() {
    this.setState({
      isAdmin: SessionStore.isAdmin()
    });

    SessionStore.on("change", () => {
      this.setState({
        isAdmin: SessionStore.isAdmin()
      });
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
   
    const OrganizationRows = this.state.organizations.map((organization, i) => (
      <OrganizationRow
        onDelete={this.onDelete}
        key={organization.id}
        organization={organization}
      />
    ));

    return (
      <div className={classes.wrapper}>
        <Popup
          open={this.state.popupOpen}
          description={
            'Are you sure you want to delete "' +
            this.state.deleteName +
            '" organization?'
          }
          title="Delete Organization"
          actionTitle="Delete"
          action={() => {
            OrganizationStore.deleteOrganization(
              this.state.deleteID,
              responseData => {
                SessionStore.fetchProfile(() => {
                  this.setState({ popupOpen: false });
                  this.updatePage(this.props);
                });
              }
            );
          }}
        />
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Name</TableCell>
                <TableCell>Display name</TableCell>
                <TableCell>Can have gateways</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Link to="/organizations/create" className={classes.noStyle}>
                    <Button
                      className={classes.button}
                      variant="raised"
                      color="primary"
                    >
                      <AddIcon />
                      Create Organization
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {OrganizationRows}
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

ListOrganizations.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ListOrganizations);
