import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import Image from "../images/network.jpg";
import LogoImage from "../images/logo_clr.svg";

const styles = theme => ({
  card: {
    maxWidth: 600,
    minHeight: 400,
    margin: "auto",
    marginTop: 100,
    justifyContent: "center",
    display: "flex"
  },
  logoWrapper: {
    width: "100%",
    height: "auto",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  logo: {
    display: "block",
    width: "100%",
    maxWidth: 500,
    height: "auto"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  cardContentTop: {
    flex: 1
  },
  textfield: {
    width: "100%",
    marginTop: 4,
    marginBottom: 4,
  },
  cardContentBottom: {
    display: "flex",
    justifyContent: "space-between"
  }
});

class UserForm extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      passwordRepeat: "",
      passwordValidated: true,
      showPasswordField: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.setState({
      showPasswordField: typeof this.props.user.id === "undefined",
      user: this.props.user
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showPasswordField: typeof nextProps.user.id === "undefined",
      user: nextProps.user
    });
  }

  onChange(field, e) {
    let user = this.state.user;
    if (e.target.type === "checkbox") {
      user[field] = e.target.checked;
    } else {
      user[field] = e.target.value;
    }
    this.setState({
      user: user
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.isConfirmedPassword()) {
      this.props.onSubmit(this.state.user);
    }
  }

  handleRepeatPasswordChange = event => {
    this.setState({ passwordRepeat: event.target.value });
  };

  isConfirmedPassword() {
    this.setState({
      passwordValidated: this.state.passwordRepeat === this.state.user.password
    });
    return this.state.passwordRepeat === this.state.user.password;
  }

  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <div className={classes.logoWrapper} style={{backgroundImage: `url(${Image})`}}>
        </div>        
        <form className={classes.form} onSubmit={this.handleSubmit}>
          <CardContent className={classes.cardContentTop}>
            <img className={classes.logo} src={LogoImage} alt="Not found" />
            <div className="form-group">
              <TextField
                className={classes.textfield}
                id="username"
                label="Username"
                type="text"
                placeholder="username"
                required
                value={this.state.user.username || ""}
                onChange={this.onChange.bind(this, "username")}
              />
            </div>
            <div className="form-group">
              <TextField
                className={classes.textfield}
                id="email"
                label="E-mail"
                type="email"
                placeholder="e-mail address"
                required
                value={this.state.user.email || ""}
                onChange={this.onChange.bind(this, "email")}
              />
            </div>
            <div
              className={
                "form-group " + (this.state.showPasswordField ? "" : "hidden")
              }
            >
              <TextField
                className={classes.textfield}
                id="password"
                type="password"
                label="Password"
                placeholder="password"
                required
                value={this.state.user.password || ""}
                onChange={this.onChange.bind(this, "password")}
              />
            </div>
            <div
              className={
                "form-group " + (this.state.showPasswordField ? "" : "hidden")
              }
            >
              <TextField
                className={classes.textfield}
                id="repeatPassword"
                type="password"
                label="Repeat Password"
                placeholder="repeat password"
                required
                defaultValue=""
                error={!this.state.passwordValidated}
                onChange={this.handleRepeatPasswordChange}
              />
            </div>
          </CardContent>
          <CardContent className={classes.cardContentBottom}>
            <Button variant="raised" onClick={this.props.history.goBack}>
              Go back
            </Button>
            <Button variant="raised" type="submit" className="btn btn-primary">
              Submit
            </Button>
          </CardContent>
        </form>
      </Card>
    );
  }
}

UserForm.propTypes = {
  classes: PropTypes.object.isRequired
};

UserForm = withStyles(styles)(UserForm);
export default withRouter(UserForm);
