import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import UserStore from "../../stores/UserStore";
import UserForm from "../../components/UserForm";

class CreateUser extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(user) {
    UserStore.register(user, responseData => {
      this.props.history.push("/login");
    });
  }

  render() {
    return (
      <div>
          <div className="panel-body">
            <UserForm user={this.state.user} onSubmit={this.onSubmit} />
          </div>
        </div>
    );
  }
}

export default withRouter(CreateUser);
