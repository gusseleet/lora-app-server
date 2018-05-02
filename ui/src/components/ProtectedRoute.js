import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import SessionStore  from './../stores/SessionStore';

class ProtectedRoute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component: props.component,
            authorize: props.authorize,
            location: props.location,
            exact: props.exact,
            user: SessionStore.getUser(),
        };
    }

    isLoggedIn() {
        let user = this.state.user;
        return !(Object.keys(user).length === 0);
    }

    isAuthorized() {
        return this.isLoggedIn();
    }

    render() {
        return (
            <Route
                exact={this.state.exact}
                location={this.state.location}
                render={props =>
                    this.isAuthorized() ? (
                        <this.state.component {...props} />
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: { from: props.location }
                            }}
                        />
                    )
                }
            />
        );
    }
}

export default ProtectedRoute;
