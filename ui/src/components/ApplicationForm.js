import React, { Component } from "react";
import { withRouter } from "react-router-dom";
// import {Controlled as CodeMirror} from "react-codemirror2";
import TextField from "material-ui/TextField";
import { withStyles } from "material-ui/styles";
import { InputLabel } from "material-ui/Input";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";

import ServiceProfileStore from "../stores/ServiceProfileStore";
import Dropdown from "./Dropdown.js";
import "codemirror/mode/javascript/javascript";

const styles = theme => ({
  button: {
    paddingLeft: 6
  },
  buttonHolder: {
    marginTop: 30,
    marginBottom: 30
  },
  textField: {
    width: 250,
    display: "block"
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  }
});

class ApplicationForm extends Component {
  constructor() {
    super();
    this.state = {
      application: {},
      serviceProfiles: [],
      update: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({
      application: this.props.application
    });

    ServiceProfileStore.getAllForOrganizationID(
      this.props.organizationID,
      9999,
      0,
      (totalCount, serviceProfiles) => {
        this.setState({
          serviceProfiles: serviceProfiles
        });
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      application: nextProps.application,
      update: nextProps.application.id !== undefined
    });
  }

  onChange(field, e) {
    let application = this.state.application;
    if (e.target.type === "number") {
      application[field] = parseInt(e.target.value, 10);
    } else if (e.target.type === "checkbox") {
      application[field] = e.target.checked;
    } else {
      application[field] = e.target.value;
    }
    this.setState({ application: application });
  }

  onSelectChange(field, event) {
    let application = this.state.application;
    if (event !== null) {
      application[field] = event.target.value;
    } else {
      application[field] = null;
    }
    this.setState({
      application: application
    });
  }

  onCodeChange(field, editor, data, newCode) {
    let application = this.state.application;
    application[field] = newCode;
    this.setState({
      application: application
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.application);
  }

  render() {
    const { classes } = this.props;

    const serviceProfileOptions = this.state.serviceProfiles.map(
      (serviceProfile, i) => {
        return {
          value: serviceProfile.serviceProfileID,
          label: serviceProfile.name
        };
      }
    );

    const payloadCodecOptions = [
      { value: "", label: "None" },
      { value: "CAYENNE_LPP", label: "Cayenne LPP" },
      { value: "CUSTOM_JS", label: "Custom JavaScript codec functions" }
    ];

    // const codeMirrorOptions = {
    //   lineNumbers: true,
    //   mode: "javascript",
    //   theme: 'base16-light',
    // };

    let payloadEncoderScript = this.state.application.payloadEncoderScript;
    let payloadDecoderScript = this.state.application.payloadDecoderScript;

    if (payloadEncoderScript === "" || payloadEncoderScript === undefined) {
      payloadEncoderScript = `// Encode encodes the given object into an array of bytes.
//  - fPort contains the LoRaWAN fPort number
//  - obj is an object, e.g. {"temperature": 22.5}
// The function must return an array of bytes, e.g. [225, 230, 255, 0]
function Encode(fPort, obj) {
  return [];
}`;
    }

    if (payloadDecoderScript === "" || payloadDecoderScript === undefined) {
      payloadDecoderScript = `// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
  return {};
}`;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Typography variant="headline">{this.props.formName}</Typography>
        <TextField
          id="name"
          label="Application Name"
          className={classes.textField}
          required
          value={this.state.application.name || ""}
          onChange={this.onChange.bind(this, "name")}
          pattern="[\w-]+"
        />
        <Typography component="p" className={classes.helpBox}>
          The name may only contain words, numbers and dashes.
        </Typography>

        <TextField
          id="description"
          label="Application Description"
          className={classes.textField}
          multiline
          rows="4"
          placeholder="An optional note about the application..."
          value={this.state.application.description || ""}
          onChange={this.onChange.bind(this, "description")}
          pattern="[\w-]+"
        />

        <InputLabel htmlFor="serviceProfileID">Service-profile</InputLabel>
        <Dropdown
          options={serviceProfileOptions}
          value={this.state.application.serviceProfileID}
          onChange={this.onSelectChange.bind(this, "serviceProfileID")}
        />
        <Typography component="p" className={classes.helpBox}>
          A description of the application.
        </Typography>

        <InputLabel htmlFor="payloadCodec">Payload codec</InputLabel>
        <Dropdown
          options={payloadCodecOptions}
          value={this.state.application.payloadCodec}
          onChange={this.onSelectChange.bind(this, "payloadCodec")}
        />

        <Typography component="p" className={classes.helpBox}>
          By defining a payload codec, LoRa App Server can encode and decode the
          binary device payload for you.
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
    );
  }
}

ApplicationForm = withStyles(styles)(ApplicationForm);
export default withRouter(ApplicationForm);
