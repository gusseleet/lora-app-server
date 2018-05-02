import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withStyles } from "material-ui/styles";

import Dropdown from "../components/Dropdown";

import OrganizationStore from "../stores/OrganizationStore";
import SessionStore from "../stores/SessionStore";

const styles = theme => ({
  container: {
    width: "auto",
    height: 50,
    justifyContent: "left",
    display: "flex"
  },
  dropdown: {
    height: 1,
    margin: "auto"
  }
});

class OrganizationSelect extends Component {
  constructor() {
    super();

    this.state = {
      organization: {},
      showDropdown: false,
      organizationID: -1,
      initialOptions: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.setSelectedOrganization = this.setSelectedOrganization.bind(this);
    this.setInitialOrganizations = this.setInitialOrganizations.bind(this);
  }

  componentDidMount() {
    this.setInitialOrganizations();
  }

  componentWillMount() {
    OrganizationStore.getOrganization(
      this.props.match.params.organizationID,
      org => {
        this.setState({
          organization: org,
          organizationID: org.id
        });
      }
    );

    OrganizationStore.getAll("", 2, 0, (totalCount, orgs) => {
      if (totalCount >= 1) {
        this.setState({
          showDropdown: true
        });
      }
    });
  }

  setSelectedOrganization() {
    SessionStore.setOrganizationID(this.state.organization.id);
  }

  setInitialOrganizations() {
    OrganizationStore.getAll("", 1000, 0, (totalCount, orgs) => {
      this.setState({
        initialOptions: orgs
      });
    });
  }

  handleSubmit(i) {
    SessionStore.setOrganizationID(this.state.initialOptions[i].id);
    this.props.history.push("/");
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    // Go through initialOptions and find selected value in dropdown, then
    // Call handleSumbit on found index variable.
    for (var i = 0; i < this.state.initialOptions.length; i++) {
      if (event.target.value === this.state.initialOptions[i].id) {
        this.handleSubmit(i);
      }
    }
  };

  render() {
    const { classes } = this.props;

    // Define rows that will be contained in Dropdown
    const networkServerOptions = this.state.initialOptions.map((n, i) => {
      return {
        value: n.id,
        label: n.name
      };
    });

    // Create variable that is set depending on wether dropdown is loaded
    // To ensure that objects exist inside the Dropdown
    return (
      <Dropdown
        disabledUnderline={true}
        className={classes.dropdown}
        value={this.state.organizationID}
        options={networkServerOptions}
        onChange={this.handleChange("organizationID")}
      />
    );
  }
}

OrganizationSelect = withStyles(styles)(OrganizationSelect);
export default withRouter(OrganizationSelect);
