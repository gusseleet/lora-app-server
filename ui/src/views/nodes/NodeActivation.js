import React, { Component } from "react";
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import Checkbox from "material-ui/Checkbox";
import TextField from "material-ui/TextField";

import NodeStore from "../../stores/NodeStore";

const styles = theme => ({
  textField: {
    width: 400,
  },
  whitespace: {
    marginTop: 10,
  },
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  button: {
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 14
  },
  buttonHolder: {
    marginTop: 30
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  }
});

class NodeActivation extends Component {
  constructor() {
    super();

    this.state = {
      activation: {},
    };
  }

  componentDidMount() {
    NodeStore.getActivation(this.props.match.params.devEUI, (nodeActivation) => {
      this.setState({
        activation: nodeActivation,
      });
    });
  }

  render() {
    const { classes } = this.props;

    if (false) {
      return(
        <Card className={classes.card}>
          <CardContent>
            <Typography component="p">
              The node has not been activated yet or device has been inactive for a long time.
            </Typography>
          </CardContent>
        </Card>
      );
    } else {
      return(
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="headline">Device Activation Info</Typography>
            <form onSubmit={this.handleSubmit}>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="devAddr"
                  disabled
                  label="Device address"
                  className={classes.textField}
                  value={this.state.activation.devAddr || ''}
                />
              </FormGroup>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="nwkSKey"
                  disabled
                  label="Network session key"
                  className={classes.textField}
                  value={this.state.activation.nwkSKey || ''}
                />
              </FormGroup>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="appSKey"
                  disabled
                  label="Application session key"
                  className={classes.textField}
                  value={this.state.activation.appSKey || ''}
                />
              </FormGroup>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="fCntUp"
                  disabled
                  label="Uplink frame-counter"
                  className={classes.textField}
                  value={this.state.activation.fCntUp || 0}
                />
              </FormGroup>
              <FormGroup className={classes.whitespace} row>
                <TextField
                  id="fCntDown"
                  disabled
                  label="Downlink frame-counter"
                  className={classes.textField}
                  value={this.state.activation.fCntDown || 0}
                />
              </FormGroup>

              <FormGroup className={classes.whitespace} row>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="skipFCntCheck"
                      checked={!!this.state.activation.skipFCntCheck}
                      value="canHaveGateways"
                      disabled
                    />
                  }
                  label="Disable frame-counter validation"
                />

                <Typography component="p" className={classes.helpBox}>
                  Note that disabling the frame-counter validation will compromise security as it enables people to perform replay-attacks.
                  This setting can only be set for ABP devices.
                </Typography>
              </FormGroup>
            </form>
          </CardContent>
        </Card>
      );
    }
  }
}

export default withStyles(styles)(NodeActivation);
