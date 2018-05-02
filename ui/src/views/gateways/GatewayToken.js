import React, { Component } from 'react';
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import { FormGroup } from "material-ui/Form";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";

import GatewayStore from "../../stores/GatewayStore";

const styles = theme => ({
  textField: {
    width: 200,
  },
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    justifyContent: "center",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  button: {
    marginTop: 24,
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 14
  },
  buttonHolder: {
    marginTop: 30
  },
});


class GatewayToken extends Component {
  constructor() {
    super();

    this.state = {
      token: "",
    };

    this.generateToken = this.generateToken.bind(this);
  }

  generateToken() {
    GatewayStore.generateGatewayToken(this.props.match.params.mac, (responseData) => {
      this.setState({
        token: responseData.token,
      });
    });
  }

  render() {
    const { classes } = this.props;

    return(
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="headline">Token</Typography>
          <Typography component="p">
            In order to grant <a href="https://docs.loraserver.io/lora-channel-manager/overview/">LoRa Channel Manager</a> access
            to the gateway API provided by <a href="https://docs.loraserver.io/loraserver/">LoRa Server</a>, a token must be generated.
            Note that this token is specific to this gateway. Generating a new token does not invalidate a previous
            generated token.
          </Typography>
          <form>
            <FormGroup row>
              <TextField
                id="name"
                label="Gateway token"
                className={classes.textField}
                value={this.state.token}
              />
            </FormGroup>
            <div className={classes.buttonHolder}>
              <Button
                className={classes.button}
                onClick={this.generateToken}
                variant="raised"
              >
                Generate token
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(GatewayToken);
