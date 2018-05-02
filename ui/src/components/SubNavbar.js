import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import AppBar from "material-ui/AppBar";
import Tabs, { Tab } from "material-ui/Tabs";

const styles = theme => ({
  tabs: {
    margin: "auto"
  }
});

class SubNavbar extends Component {
  render() {
    const { classes, tabs, activeTab } = this.props;

    const tabButtons = tabs.map((tab, i) => (
      <Tab key={i} label={tab.label} component={Link} to={tab.url} value={tab.value}/>
    ));
    
    return (
      <div className={classes.NavBarMargin}>
        <div>
          <AppBar position="static" color="default">
            <Tabs
              className={classes.tabs}
              value={activeTab || false}
              onChange={this.handleChange}
            >
              {tabButtons}
            </Tabs>
          </AppBar>
        </div>
      </div>
    );
  }
}

SubNavbar.propTypes = {
  classes: PropTypes.object.isRequired
};

SubNavbar = withStyles(styles)(SubNavbar);
export default withRouter(SubNavbar);
