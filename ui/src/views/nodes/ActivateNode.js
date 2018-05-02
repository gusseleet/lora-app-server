import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import { FormGroup, FormControlLabel, FormControl } from "material-ui/Form";
import Checkbox from "material-ui/Checkbox";
import Button from "material-ui/Button";
import GenerateIcon from "material-ui-icons/Autorenew";
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import IconButton from 'material-ui/IconButton';

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
  buttonHolder: {
    marginTop: 10,
    marginBottom:10,
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  }
});



class NodeActivationForm extends Component {
  constructor() {
    super();

    this.state = {
      activation: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.getRandomDevAddr = this.getRandomDevAddr.bind(this);
    this.getRandomAppSKey = this.getRandomAppSKey.bind(this);
    this.getRandomNwkSKey = this.getRandomNwkSKey.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.activation);
  }

  onChange(field, e) {
    let activation = this.state.activation;
    if (e.target.type === "number") {
      activation[field] = parseInt(e.target.value, 10);
    } else if (e.target.type === "checkbox") {
      activation[field] = e.target.checked;
    } else {
      activation[field] = e.target.value;
    }
    this.setState({activation: activation});
  }

  getRandomDevAddr(e) {
    e.preventDefault();

    NodeStore.getRandomDevAddr(this.props.devEUI, (responseData) => {
      let activation = this.state.activation;
      activation["devAddr"] = responseData.devAddr;
      this.setState({
        activation: activation,
      });
    });
  }

  getRandomNwkSKey(e) {
    e.preventDefault();

    let nwkSKey = '';
    const possible = 'abcdef0123456789';
    for(let i = 0; i < 32; i++){
      nwkSKey += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    let activation = this.state.activation;
    activation["nwkSKey"] = nwkSKey;
    this.setState({activation: activation});
  }

  getRandomAppSKey(e) {
    e.preventDefault();

    let appSKey = '';
    const possible = 'abcdef0123456789';
    for(let i = 0; i < 32; i++){
      appSKey += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    let activation = this.state.activation;
    activation["appSKey"] = appSKey;
    this.setState({activation: activation});
  }

  render() {
    const { classes } = this.props.classes;

    return(
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="headline">Activate Device</Typography>
          <form onSubmit={this.handleSubmit}>
            <FormGroup className={classes.whitespace} row>
              <FormControl>
                <InputLabel htmlFor="devAddr">Device address</InputLabel>
                <Input
                  id="devAddr"
                  pattern="[a-fA-F0-9]{8}"
                  placeholder="00000000"
                  type="text"
                  className={classes.textField}
                  label="Device address"
                  required value={this.state.activation.devAddr || ''}
                  onChange={this.onChange.bind(this, 'devAddr')}
                  endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Generate"
                      onClick={this.getRandomDevAddr}
                    >
                      <GenerateIcon />
                    </IconButton>
                  </InputAdornment>
                }
                />
              </FormControl>
            </FormGroup>

            <FormGroup className={classes.whitespace} row>
              <FormControl>
                <InputLabel htmlFor="nwkSKey">Network session key</InputLabel>
                <Input
                  id="nwkSKey"
                  placeholder="00000000000000000000000000000000"
                  label="Network session key"
                  type="text"
                  className={classes.textField}
                  pattern="[A-Fa-f0-9]{32}"
                  required value={this.state.activation.nwkSKey || ''}
                  onChange={this.onChange.bind(this, 'nwkSKey')}
                  endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Generate"
                      onClick={this.getRandomNwkSKey}
                    >
                      <GenerateIcon />
                    </IconButton>
                  </InputAdornment>
                }
                />
              </FormControl>
            </FormGroup>

            <FormGroup className={classes.whitespace} row>
              <FormControl>
                <InputLabel htmlFor="appSKey">Application session key</InputLabel>
                <Input
                  type="text"
                  className={classes.textField}
                  id="appSKey"
                  placeholder="00000000000000000000000000000000"
                  pattern="[A-Fa-f0-9]{32}"
                  required value={this.state.activation.appSKey || ''}
                  onChange={this.onChange.bind(this, 'appSKey')}
                  endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Generate"
                      onClick={this.getRandomAppSKey}
                    >
                      <GenerateIcon />
                    </IconButton>
                  </InputAdornment>
                }
                />
              </FormControl>
            </FormGroup>

            <FormGroup className={classes.whitespace} row>
              <FormControl>
                <InputLabel htmlFor="fCntUp">Uplink frame-counter</InputLabel>
                <Input
                  className={classes.textField}
                  id="fCntUp"
                  type="number"
                  min="0"
                  required value={this.state.activation.fCntUp || 0}
                  onChange={this.onChange.bind(this, 'fCntUp')}
                />
              </FormControl>
            </FormGroup>

            <FormGroup className={classes.whitespace} row>
              <FormControl>
                <InputLabel htmlFor="fCntDown">Downlink frame-counter</InputLabel>
                <Input
                  className={classes.textField}
                  id="fCntDown"
                  type="number"
                  min="0"
                  required value={this.state.activation.fCntDown || 0}
                  onChange={this.onChange.bind(this, 'fCntDown')}
                />
              </FormControl>
            </FormGroup>

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    name="skipFCntCheck"
                    id="skipFCntCheck"
                    checked={!!this.state.activation.skipFCntCheck}
                    onChange={this.onChange.bind(this, 'skipFCntCheck')}
                  />
                }
                label="Disable frame-counter validation"
              />

              <Typography component="p" className={classes.helpBox}>
                Note that disabling the frame-counter validation will compromise security as it enables people to perform replay-attacks.
                This setting can only be set for ABP devices.
              </Typography>
            </FormGroup>
            <div className={classes.buttonHolder}>
              <Button
                className={classes.button}
                onClick={this.props.history.goBack}
              >
                Go back
              </Button>
              <Button type="submit" variant="raised">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
}

class ActivateNode extends Component {
  constructor() {
    super();
    this.state = {
      activation: {},
      node: {},
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(activation) {
    NodeStore.activateNode(this.props.match.params.devEUI, activation, (responseData) => {
      this.props.history.push(`/dashboard/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}/devices/${this.props.match.params.devEUI}/edit`);
    });
  }

  render() {
    return(
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            <NodeActivationForm classes={this.props} history={this.props.history} devEUI={this.props.match.params.devEUI} onSubmit={this.onSubmit} />
          </div>
        </div>
      </div>
    );
  }
}

ActivateNode = withStyles(styles)(ActivateNode);
export default withRouter(ActivateNode);
