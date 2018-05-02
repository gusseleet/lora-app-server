import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Dropdown from './Dropdown.js';
import Typography from "material-ui/Typography";
import { FormGroup } from "material-ui/Form";
import TextField from "material-ui/TextField";
import { withStyles } from 'material-ui';
import Button from "material-ui/Button";

const styles = theme => ({
  textField: {
    width: 200,
  },
  multiline: {
    width: 300
  },
  spacingTop: {
    marginTop: 10
  },
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    justifyContent: "left",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden"
  },
  helpBox: {
    padding: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8
  },
  buttonHolder: {
    marginTop: 30
  },
  mapStyle: {
    width: "100%",
    height:300,
  },
  button_over: {
    marginRight: 8,
    paddingLeft: 6,
    marginBottom: 6
  },
  button_under: {
    marginRight: 8,
    paddingLeft: 6,
    marginTop: 4,
  },
  dropdown: {
    marginTop: 6,
    marginBottom: 6,
  }

});


class ApplicationHTTPIntegrationHeaderForm extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onChange(field, e) {
    let header = this.props.header;
    header[field] = e.target.value;

    this.props.onHeaderChange(this.props.index, header);
  }

  onDelete(e) {
    this.props.onDeleteHeader(this.props.index);
    e.preventDefault();
  }

  render() {

    const { classes } = this.props;
    
    return(
      <div>
          <FormGroup row>
            <TextField
              name="form-control"
              className={classes.textField}
              placeholder="Header name"
              value={this.props.header.key || ''}
              onChange={this.onChange.bind(this, 'key')}
            />
          </FormGroup>

          <FormGroup className={classes.spacingTop} row>
            <TextField
              name="form-control"
              className={classes.textField}
              placeholder="Header value"
              value={this.props.header.value || ''}
              onChange={this.onChange.bind(this, 'value')}
            />
          </FormGroup>
          <Button
            className={classes.button_under}
            onClick={this.onDelete}
            variant="raised"
          >
            REMOVE
          </Button>
      </div>
    );
  }
}

class ApplicationHTTPIntegrationForm extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onHeaderChange = this.onHeaderChange.bind(this);
    this.addHeader = this.addHeader.bind(this);
    this.onDeleteHeader = this.onDeleteHeader.bind(this);
  }

  onChange(field, e) {
    let integration = this.props.integration;
    integration[field] = e.target.value;

    this.props.onFormChange(integration);
  }

  addHeader(e) {
    let integration = this.props.integration;
    if (typeof(integration.headers) === "undefined") {
      integration.headers = [{}];
    } else {
      integration.headers.push({});
    }

    this.props.onFormChange(integration);

    e.preventDefault();
  }

  onHeaderChange(index, header) {
    let integration = this.props.integration;
    integration.headers[index] = header;

    this.props.onFormChange(integration);
  }

  onDeleteHeader(index) {
    let integration = this.props.integration;
    integration.headers.splice(index, 1);

    this.props.onFormChange(integration);
  }

  render() {

    const { classes } = this.props;


    let headers = [];
    if (typeof(this.props.integration.headers) !== "undefined") {
      headers = this.props.integration.headers;
    }

    const HTTPHeaders = headers.map((header, i) => <ApplicationHTTPIntegrationHeaderForm key={i} index={i} header={header} classes={classes} onHeaderChange={this.onHeaderChange} onDeleteHeader={this.onDeleteHeader} />);

    return(

      
      <div>
        <div>
          <Typography variant="headline">Headers</Typography>
              {HTTPHeaders}
              <div className={classes.buttonHolder}>
                <Button 
                  variant="raised"
                  className={classes.button_over}
                  onClick={this.addHeader}
                > 
                  Add Header
                </Button> 
            </div> 

      </div>     
         <Typography variant="headline">Endpoints</Typography>
              <FormGroup row>
                <TextField
                  id="dataUpURL"
                  name="dataUpURL"
                  label="Uplink data URL"
                  className={classes.textField}
                  placeholder="http://example.com/uplink"
                  value={this.props.integration.dataUpURL || ''}
                  onChange={this.onChange.bind(this, 'dataUpURL')}
                />
              </FormGroup>

              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="joinNotificationURL"
                  name="joinNotificationURL"
                  label="Join notification URL"
                  className={classes.textField}
                  placeholder="http://example.com/join"
                  value={this.props.integration.joinNotificationURL || ''}
                  onChange={this.onChange.bind(this, 'joinNotificationURL')}
                />
              </FormGroup>

              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="ackNotificationURL"
                  name="ackNotificationURL"
                  label="ACK notification URL"
                  className={classes.textField}
                  placeholder="http://example.com/ack"
                  value={this.props.integration.ackNotificationURL || ''}
                  onChange={this.onChange.bind(this, 'ackNotificationURL')}
                />
              </FormGroup>

              <FormGroup className={classes.spacingTop} row>
                <TextField
                  id="errorNotificationURL"
                  name="errorNotificationURL"
                  label="Error notification URL"
                  className={classes.textField}
                  placeholder="http://example.com/error"
                  value={this.props.integration.errorNotificationURL || ''}
                  onChange={this.onChange.bind(this, 'errorNotificationURL')}
                />
              </FormGroup>      
      </div>
    );
  }
}

class ApplicationIntegrationForm extends Component {
  constructor() {
    super();

    this.state = {
      integration: {},
      kindDisabled: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onKindSelect = this.onKindSelect.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      integration: this.props.integration,
    });

    if (typeof(this.props.integration.kind) !== "undefined") {
      this.setState({
        kindDisabled: true,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      integration: nextProps.integration,
    });

    if (nextProps.integration.kind !== "") {
      this.setState({
        kindDisabled: true,
      });
    }
  }

  onChange(field, e) {
    let integration = this.state.integration;
    integration[field] = e.target.value;

    this.setState({
      integration: integration,
    });
  }

  onFormChange(integration) {
    this.setState({
      integration: integration,
    });
  }

  onKindSelect(event) {
    let integration = this.state.integration;
    integration.kind = event.target.value;
    this.setState({
      integration: integration,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.integration);
  }

  render() {

    const { classes } = this.props;
    const kindOptions = [
      {value: "http", label: "HTTP integration"},
    ];

    let form = <div></div>;

    if (this.state.integration.kind === "http") {
      form = <ApplicationHTTPIntegrationForm classes={classes} integration={this.state.integration} onFormChange={this.onFormChange} />;
    }

    return(
      <form onSubmit={this.handleSubmit}>

      <label className={classes.spacingTop}>Integration kind</label>
      <div className={classes.dropdown}>
      <FormGroup row>
         <Dropdown 
          name="kind"
          value={this.state.integration.kind}
          options={kindOptions}
          onChange={this.onKindSelect}
          clearable={false}
          disabled={this.state.kindDisabled}
          /> 
      </FormGroup>
      </div>


        {form}
        <div className={classes.buttonHolder}>
          <Button
            className={classes.button_under}
            onClick={this.props.history.goBack}
          >
            Go back
          </Button>
          <Button className={classes.button_under}
            type="submit"
            variant="raised">
            Submit
          </Button>
        </div>
      </form>
    );
  }
}

ApplicationIntegrationForm = withStyles(styles)(ApplicationIntegrationForm);
export default withRouter(ApplicationIntegrationForm);
