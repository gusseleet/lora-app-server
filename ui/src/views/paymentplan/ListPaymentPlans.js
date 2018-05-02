import React, { Component } from "react";
import { Link } from "react-router-dom";

import SessionStore from "../../stores/SessionStore";
import PaymentPlanStore from "../../stores/PaymentPlanStore";

import Card from "material-ui/Card";
import AddIcon from "material-ui-icons/Add";
import { withStyles } from "material-ui/styles";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";
import Button from "material-ui/Button";

import CreatePaymentPlan from "../paymentplan/CreatePaymentPlan";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 640,
    minHeight: 300,
    margin: "auto",
    marginTop: 30,
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  },
  cardContent: {
    flex: 1
  },
  marginTop: {
    marginTop: 30
  },
  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  }
});

class PaymentPlanRow extends Component {
  render() {
    return (
      <TableRow>
        <TableCell>
          <Link
            to={`/dashboard/${
              this.props.organizationID
            }/gateway-networks/payment-plans/${this.props.paymentplan.id}`}
          >
            {this.props.paymentplan.name}
          </Link>
        </TableCell>
      </TableRow>
    );
  }
}

class ListPaymentPlans extends Component {
  constructor() {
    super();

    this.state = {
      paymentplans: [],
      pageSize: 1000,
      pageNumber: 0,
      pages: 1,
      isAdmin: false,
      createPaymentPlanWindow: false
    };

    this.updatePage = this.updatePage.bind(this);
    this.showCreateWindow = this.showCreateWindow.bind(this);
    this.closeCreateWindow = this.closeCreateWindow.bind(this);
  }

  componentDidMount() {
    this.updatePage(this.props);

    SessionStore.on("change", () => {
      this.setState({
        isAdmin:
          SessionStore.isAdmin() ||
          SessionStore.isOrganizationAdmin(this.props.organizationID)
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  updatePage(props) {
    this.setState({
      isAdmin:
        SessionStore.isAdmin() ||
        SessionStore.isOrganizationAdmin(props.organizationID)
    });

    // TODO: Possible pagination & Realtime update issues
    //const query = new URLSearchParams(props.location.search);
    //const page = query.get("page") === null ? 1 : query.get("page");

    PaymentPlanStore.getAll(
      props.organizationID,
      "",
      this.state.pageSize,
      0 * this.state.pageSize,
      (totalCount, paymentplans) => {
        this.setState({
          paymentplans: paymentplans,
          pages: Math.ceil(totalCount / this.state.pageSize)
        });
      }
    );

    window.scrollTo(0, 0);
  }

  showCreateWindow() {
    this.setState({
      createPaymentPlanWindow: true
    });
  }
  closeCreateWindow() {
    this.setState({
      createPaymentPlanWindow: false
    });
  }

  render() {
    const PaymentPlanRows = this.state.paymentplans.map((pp, i) => (
      <PaymentPlanRow key={pp.id} paymentplan={pp} />
    ));
    const { classes } = this.props;

    let visibleWindow;
    if (!this.state.createPaymentPlanWindow) {
      visibleWindow = (
        <div>
          <div>
            <Button
              className={classes.marginTop}
              onClick={this.showCreateWindow}
              variant="raised"
            >
              <AddIcon />
              Create payment plan
            </Button>
          </div>
          <Card className={classes.card}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{PaymentPlanRows}</TableBody>
            </Table>
          </Card>
        </div>
      );
    } else {
      visibleWindow = (
        <div>
          <CreatePaymentPlan closeWindow={this.closeCreateWindow} />
        </div>
      );
    }
    return visibleWindow;
  }
}

export default withStyles(styles)(ListPaymentPlans);
