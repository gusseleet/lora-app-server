import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import ErrorStore from "../stores/ErrorStore";
import dispatcher from "../config/dispatcher";
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';


class ErrorBar extends Component {
  constructor() {
    super();
    this.handleDelete = this.handleDelete.bind(this);
    this.state = {
      open: true,
    }
  }

  handleDelete() {
    dispatcher.dispatch({
      type: "DELETE_ERROR",
      id: this.props.id,
    });
  }

  handleClick = () => {
    this.setState({ open: true });
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.handleDelete();
    this.setState({ open: false });
  };

  render() {
    const errorMessage = `Error: ${this.props.error.error} (code: ${this.props.error.code})`;

    return (
      <div className="alert alert-danger">
        <Snackbar
          disableWindowBlurListener={true}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={this.state.open}
          autoHideDuration={4000}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={errorMessage}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className="close"
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div> 
    )
  }
}

class Errors extends Component {
  constructor() {
    super();
    this.state = {
      errors: ErrorStore.getAll(),
    };
  }

  componentWillReceiveProps(nextProps) {
      if (this.props.location !== nextProps.location) {
        ErrorStore.clear();
      }
  }

  componentWillMount() {
    ErrorStore.on("change", () => {
      this.setState({
        errors: ErrorStore.getAll(),
      });
    });
  }

  render() {
    const ErrorStack = this.state.errors.map((error, i) => <ErrorBar key={error.id} id={error.id} error={error.error} />);

    return (
          <div>
            {ErrorStack}
          </div>
        )
  }
}

export default withRouter(Errors);
