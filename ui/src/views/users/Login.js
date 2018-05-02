import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import SessionStore from "../../stores/SessionStore";
import TextField from "material-ui/TextField";
import Card, { CardContent } from "material-ui/Card";
import Image from "../../images/network.jpg";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import LogoImage from "../../images/logo_clr.svg";

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
    display: "flex"
  },
  button: {
    alignSelf: "flex-end",
    marginLeft: "auto"
  },
  register: {
    marginTop: 15
  },
  li: {
    listStyleType: "none"
  }
});

class Login extends Component {
  constructor() {
    super();

    this.state = {
      login: {},
      registration: null
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    SessionStore.logout(() => {});
    this.setState({
      registration: SessionStore.getRegistration()
    });

    SessionStore.on("change", () => {
      this.setState({
        registration: SessionStore.getRegistration()
      });
    });
  }

  onChange(field, e) {
    let login = this.state.login;
    login[field] = e.target.value;
    this.setState({
      login: login
    });
  }

  onSubmit(e) {
    e.preventDefault();
    SessionStore.login(this.state.login, token => {
      this.props.history.push("/");
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className="panel-body">
          <Card className={classes.card}>
            <div className={classes.logoWrapper} style={{backgroundImage: `url(${Image})`}}>
            </div>
            <form className={classes.form} onSubmit={this.onSubmit}>
              <CardContent className={classes.cardContentTop}>
                <img className={classes.logo} src={LogoImage} alt="Not found" />
                <TextField
                  className={classes.textfield}
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="username"
                  value={this.state.login.username || ""}
                  onChange={this.onChange.bind(this, "username")}
                />
                <TextField
                  className={classes.textfield}
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="password"
                  value={this.state.login.password || ""}
                  onChange={this.onChange.bind(this, "password")}
                />
                <div className={classes.register}>
                  <li className={classes.li}>
                    <Link to="/users/create">Not a user? Register here</Link>
                  </li>
                </div>
              </CardContent>
              <CardContent className={classes.cardContentBottom}>
                <Button
                  className={classes.button}
                  type="submit"
                  variant="raised"
                >
                  Login
                </Button>
              </CardContent>
            </form>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  typeof this.state.registration === "undefined"
                    ? ""
                    : this.state.registration
              }}
            />
          </Card>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired
};

Login = withStyles(styles)(Login);
export default withRouter(Login);
