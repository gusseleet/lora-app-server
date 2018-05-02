import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "material-ui/Card";
import { withStyles } from "material-ui/styles";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  }
});

class Overview extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        <Card className={classes.card}>
          <h1> overview </h1>
        </Card>
      </div>
    );
  }
}

Overview.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Overview);
