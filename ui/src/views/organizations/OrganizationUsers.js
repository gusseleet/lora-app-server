import React, { Component } from "react";
import organizationStore from "../../stores/OrganizationStore";
import AddIcon from "material-ui-icons/Add";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import Popup from "../../components/Popup";
import userStore from "../../stores/UserStore";
import AutoComplete from "../../components/AutoComplete";
import CollaboratorForm from "../../components/collaboratorForm";
import Checkbox from "material-ui/Checkbox";
import { FormControlLabel } from "material-ui/Form";

const styles = theme => ({
  content: {
    maxWidth: "100%",
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
  buttonHolder: {
    marginTop: 10
  },

  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  }
});

class OrganizationUsers extends Component {
  constructor() {
    super();

    this.state = {
      organization: {},
      users: [],
      pageSize: 5,
      userSuggestions: [],
      pageNumber: 0,
      pages: 1,
      count: 0,
      popupOpen: false,
      addID: -1,
      shallBecomeAdmin: false
    };

    this.updatePage = this.updatePage.bind(this);
    this.inviteCollaborator = this.inviteCollaborator.bind(this);
    this.onInvite = this.onInvite.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        organization: nextProps.organization
      },
      this.updatePage(nextProps)
    );
  }

  updatePage(props, pageSize = undefined) {
    const size = pageSize === undefined ? this.state.pageSize : pageSize; 
    const query = new URLSearchParams(props.location.search);
    const page = query.get("page") === null ? 1 : query.get("page");
    
    organizationStore.getUsers(
      props.organization.id,
      size,
      (page - 1) * size,
      (totalCount, users) => {
        this.setState({
          users: users,
          pageNumber: page - 1,
          count: parseInt(totalCount, 10),
          pages: Math.ceil(totalCount / this.state.pageSize)
        });
        window.scrollTo(0, 0);
      }
    );
  }

  didWrite(e) {
    userStore.getAll(e.target.value, 10, 0, (count, result) => {
      this.setState({
        userSuggestions: result
      });
    });
  }

  onInvite() {
    this.setState({ popupOpen: true });
  }

  onDelete(user) {
    organizationStore.removeUser(
      this.state.organization.id,
      user.id,
      responseData => {
        this.updatePage(this.props);
      }
    );
  }

  inviteCollaborator(id) {
    userStore.getUser(id, user => {
      organizationStore.addUser(
        this.state.organization.id,
        {
          id: this.state.organization.id,
          isAdmin: this.state.shallBecomeAdmin,
          userID: user.id
        },
        () => {
          this.setState({
            addID: -1,
            shallBecomeAdmin: false,
            popupOpen: false
          });
          this.updatePage(this.props);
        }
      );
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

    const collaborators = this.state.users.map((user, index) => ({
      onDelete: this.onDelete,
      organizationID: this.props.organization.id,
      collaborator: user
    }));

    return (
      <div className={classes.wrapper}>
        <Popup
          open={this.state.popupOpen}
          handleClose={() => {
            this.setState(prevState => ({ popupOpen: !prevState.popupOpen }));
          }}
          description="Enter username of the user that you want to invite"
          title="Add Collaborator"
          actionTitle="Add"
          objects={
            <div>
              <AutoComplete
                items={this.state.userSuggestions}
                onChange={selectedItem =>
                  this.setState({ addID: selectedItem.id })
                }
                didWrite={() => this.didWrite.bind(this)}
              />
              <FormControlLabel
                label="Shall become admin"
                control={
                  <Checkbox
                    checked={this.state.shallBecomeAdmin}
                    onChange={() => {
                      this.setState(prevState => ({
                        shallBecomeAdmin: !prevState.shallBecomeAdmin
                      }));
                    }}
                    value="shallBecomeAdmin"
                  />
                }
              />
            </div>
          }
          action={() => {
            this.inviteCollaborator(this.state.addID);
          }}
        />
        <div className={classes.buttonHolder}>
          <Button
            className={classes.button}
            variant="raised"
            onClick={this.onInvite}
          >
            <AddIcon />
            Invite Collaborator
          </Button>
        </div>
        <CollaboratorForm
          onChangeRowsPerPage={event => this.onChangeRowsPerPage(event)}
          count={this.state.count}
          rowsPerPage={this.state.pageSize}
          pageNumber={this.state.pageNumber}
          collaborators={collaborators} 
          onDelete={this.onDelete}
          organizationID={this.state.organization.id}
        />
      </div>
    );
  }
}

export default withStyles(styles)(OrganizationUsers);
