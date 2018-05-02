import React, { Component } from "react";
import { Link } from "react-router-dom";

import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import { withStyles } from "material-ui/styles";

import dispatcher from "../config/dispatcher";
import SessionStore from "../stores/SessionStore";
import IconButton from "material-ui/IconButton";
import Menu, { MenuItem } from "material-ui/Menu";
import AccountCircle from "material-ui-icons/AccountCircle";
import Tabs, { Tab } from "material-ui/Tabs";
import LogoImage from "../images/logo_clr.svg";

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  logo: {
    width: "100%",
    maxWidth: 160
  },
  toolbar: {
    margin: 0,
    minHeight: 48
  },
  tabs: {
    marginRight: 16
  }
};

class Navbar extends Component {
  constructor() {
    super();
    this.state = {
      user: SessionStore.getUser(),
      isAdmin: SessionStore.isAdmin(),
      userDropdownOpen: false,
      logo: SessionStore.getLogo(),
      anchorEl: null,
    };
    this.userToggleDropdown = this.userToggleDropdown.bind(this);
    this.handleActions = this.handleActions.bind(this);
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  userToggleDropdown() {
    this.setState({
      userDropdownOpen: !this.state.userDropdownOpen
    });
  }

  handleActions(action) {
    switch (action.type) {
      case "BODY_CLICK": {
        this.setState({
          userDropdownOpen: false
        });
        break;
      }
      default:
        break;
    }
  }

  componentWillMount() {
    SessionStore.on("change", () => {
      this.setState({
        user: SessionStore.getUser(),
        isAdmin: SessionStore.isAdmin(),
        logo: SessionStore.getLogo()
      });
    });
    dispatcher.register(this.handleActions);
  }

  render() {
    const { classes, activeTab } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar className={classes.toolbar}>
            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              <a className="navbar-brand" href="#/">
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof this.state.logo === "undefined"
                        ? ""
                        : this.state.logo
                  }}
                />
                <img className={classes.logo} src={LogoImage} alt="Not found" />
              </a>
            </Typography>
            <Tabs
              className={classes.tabs}
              value={activeTab || false}
              onChange={this.handleChange}
            >
              <Tab
                label="Join a network"
                component={Link}
                to="/join-a-network"
                value="join-a-network"
              />
              <Tab label="Organizations" component={Link} to="/organizations" value="organizations"/>
              <Tab label="Dashboard" component={Link} to="/" value="dashboard"/>
            </Tabs>
            <IconButton
              aria-owns={null}
              aria-haspopup="true"
              onClick={this.handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={open}
              onClose={this.handleClose}
            >
              <MenuItem
                onClick={this.handleClose}
                component={Link}
                to="/profile"
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={this.handleClose}
                component={Link}
                to="/settings"
              >
                Settings
              </MenuItem>
              <MenuItem onClick={this.handleClose} component={Link} to="/login">
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withStyles(styles)(Navbar);
