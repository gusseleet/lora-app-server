import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import { FormGroup } from "material-ui/Form";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";

import NodeStore from "../../stores/NodeStore";

const styles = theme => ({
  textField: {
    width: 400,
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


class DeviceKeysForm extends Component {
  constructor() {
    super();

    this.state = {
      deviceKeys: {
        deviceKeys: {},
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({
      deviceKeys: this.props.deviceKeys,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      deviceKeys: nextProps.deviceKeys,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.deviceKeys);
  }

  onChange(fieldLookup, e) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length-1];
    lookup.pop(); // remove last item

    let deviceKeys = this.state.deviceKeys;
    let obj = deviceKeys;

    for (const f of lookup) {
      obj = obj[f];
    }

    obj[fieldName] = e.target.value;

    this.setState({
      deviceKeys: deviceKeys,
    });
  }

  render() {
    const classes = this.props.classes;

    return(
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="headline">Device Keys(OOTA)</Typography>
          <form onSubmit={this.handleSubmit}>
            <FormGroup className={classes.whitespace} row>
              <TextField
                id="appKey"
                label="Application key"
                className={classes.textField}
                pattern="[A-Fa-f0-9]{32}"
                required value={this.state.deviceKeys.deviceKeys.appKey || ''}
                onChange={this.onChange.bind(this, 'deviceKeys.appKey')}
              />
            </FormGroup>
            <Typography component="p" className={classes.helpBox}>
              ex. 00000000000000000000000000000000 (32)
            </Typography>
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

class NodeKeys extends Component {
  constructor() {
    super();

    this.state = {
      deviceKeys: {
        deviceKeys: {},
      },
      update: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    NodeStore.getNodeKeys(this.props.match.params.devEUI, (deviceKeys) => {
      this.setState({
        update: true,
        deviceKeys: deviceKeys,
      });
    });
  }

  onSubmit(deviceKeys) {
    if (this.state.update) {
      NodeStore.updateNodeKeys(this.props.match.params.devEUI, deviceKeys, (responseData) => {
        this.props.history.push(`/dashboard/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}`);
      });
    } else {
      NodeStore.createNodeKeys(this.props.match.params.devEUI, deviceKeys, (responseData) => {
        this.props.history.push(`/dashboard/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}`);
      });
    }
  }

  render() {
    const { classes } = this.props;

    return(
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            <DeviceKeysForm classes={classes} history={this.props.history} deviceKeys={this.state.deviceKeys} onSubmit={this.onSubmit} />
          </div>
        </div>
      </div>
    );
  }
}
NodeKeys = withStyles(styles)(NodeKeys);
export default withRouter(NodeKeys);
