import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import PaymentPlanStore from "../../stores/PaymentPlanStore";
import PaymentPlanForm from "../../components/PaymentPlanForm";

class CreatePaymentPlan extends Component {
  constructor() {
    super();

    this.state = {
      paymentplan: {}
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(paymentPlan) {
    PaymentPlanStore.createPaymentPlan(
      this.props.match.params.organizationID,
      paymentPlan,
      responseData => {
        // TODO: Check responsedata
        this.props.closeWindow();
      }
    );
  }
  render() {
    return (
      <div>
        <PaymentPlanForm
          formName="Create Payment plan"
          organizationID={this.props.match.params.organizationID}
          paymentplan={this.state.paymentplan}
          onSubmit={this.onSubmit}
          closeWindow={this.props.closeWindow}
        />
      </div>
    );
  }
}

export default withRouter(CreatePaymentPlan);
