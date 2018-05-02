import React, { Component } from "react";
import Table, {
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    TableFooter,
} from "material-ui/Table";
import { withStyles } from "material-ui/styles";
import { Link } from "react-router-dom";
import DeleteIcon from "material-ui-icons/DeleteForever";
import Popup from './Popup';
import Pagination from "./Pagination";
import Dropdown from './Dropdown';


import OrganizationStore from "../stores/OrganizationStore";

const styles = theme => ({
  tableHead: {
    backgroundColor: "#F0F0F0"
  }
});

class CollaboratorRow extends Component {
  constructor() {
    super();
    this.state = {
      userIsAdmin: ""
    };
  }
  componentDidMount() {
    this.setState({
      userIsAdmin: this.props.collaborator.isAdmin ? "Yes" : "No"
    });
  }
  onSelectChange(field, event) {
    if (event !== null) {
      if (event.target.value === "Yes") {
        this.props.collaborator[field] = true;
        this.setState({
          userIsAdmin: "Yes"
        });
      } else {
        this.props.collaborator[field] = false;
        this.setState({
          userIsAdmin: "No"
        });
      }
    } else {
      this.props.collaborator[field] = null;
    }

    OrganizationStore.updateUser(
      this.props.organizationID,
      this.props.collaborator.id,
      this.props.collaborator,
      () => {
        // empty
      }
    );
  }

  render() {
    const adminRightsOptions = [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" }
    ];
    return (
      <TableRow hover>
        <TableCell>
          <Link
            to={`/organizations/${this.props.organizationID}/users/${
              this.props.collaborator.id
            }/edit`}
          >
            {this.props.collaborator.username}
          </Link>
        </TableCell>
        <TableCell>
          <Dropdown
            disabledUnderline={true}
            options={adminRightsOptions}
            value={this.state.userIsAdmin}
            onChange={this.onSelectChange.bind(this, "isAdmin")}
          />
        </TableCell>
        <TableCell>
          <DeleteIcon
            onClick={() => this.props.onDelete(this.props.collaborator)}
            color="secondary"
            style={{ cursor: "pointer" }}
          />
        </TableCell>
      </TableRow>
    );
  }
}

class CollaboratorForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupOpen: false,
      deleteName: "",
      deleteUser: {}
    };

    this.onDelete = this.onDelete.bind(this);
  }

  onDelete(user) {
    this.setState({
      popupOpen: true,
      deleteName: user.username,
      deleteUser: user
    });
  }

    render() {
        const { classes } = this.props;
        const { rowsPerPage, count, pageNumber } = this.props;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, count - pageNumber * rowsPerPage);    

        const collaboratorRows = this.props.collaborators.map((collaborator, index) => (
            <CollaboratorRow
                onDelete={this.onDelete}
                key={index}
                organizationID={this.props.organizationID}
                collaborator={collaborator.collaborator}
            />
        ));
        
        return(
            <div>
                <Popup
                    open={this.state.popupOpen}
                    description={'Are you sure you want to remove collaborator "' + this.state.deleteName + '" from organization?'}
                    title='Remove Collaborator'
                    actionTitle='Remove'
                    handleClose={() => {this.setState(prevState => ({popupOpen: !prevState.popupOpen}))}}
                    action={() => {
                        this.props.onDelete(this.state.deleteUser)
                        this.setState({ popupOpen: false })
                    }}
                />
                <div className={classes.content}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow className={classes.tableHead}>
                                <TableCell>Username</TableCell>
                                <TableCell>Admin rights</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {collaboratorRows}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 48 * emptyRows }}>
                                  <TableCell colSpan={3} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <Pagination
                                colSpan={4}
                                count={this.props.count}
                                rowsPerPage={this.props.rowsPerPage}
                                page={this.props.pageNumber}
                                pathname={`/organizations/${this.props.organizationID}`}
                                onChangeRowsPerPage={this.props.onChangeRowsPerPage.bind(this)}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CollaboratorForm);
