import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ApplicationStore from "../../stores/ApplicationStore";

import { withStyles } from "material-ui/styles";
import Card from "material-ui/Card";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";
import AddIcon from "material-ui-icons/Add";
import Button from "material-ui/Button";

const styles = theme => ({
  card: {
    minHeight: 300,
    width: "100%",
    maxWidth: 1280,
    margin: "auto",
    marginTop: 30,
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  },
  cardContent: {
    flex: 1
  },
  noStyle: {
    textDecorationLine: "none"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  wrapper: {
    width: "100%",
    maxWidth: 1280,
    margin: "auto"
  },
});


const integrationMap = {
  HTTP: {
    name: 'HTTP integration',
    endpoint: 'http',
  },
};


class IntegrationRow extends Component {
  render() {
    return(
      <TableRow hover>
        <TableCell>
          <Link to={`/dashboard/${this.props.params.organizationID}/applications/${this.props.params.applicationID}/integrations/http`}>{integrationMap[this.props.kind].name}</Link>
        </TableCell>
      </TableRow>
    );
  }
}

class ApplicationIntegrations extends Component {
  constructor() {
    super();

    this.state = {
      integrations: [],
    };
  }

  componentDidMount() {
    ApplicationStore.listIntegrations(this.props.match.params.applicationID, (integrations) => {
      this.setState({
        integrations: integrations.kinds,
      });
    });    
  }

  render() {
    const IntegrationRows = this.state.integrations.map((integration, i) => <IntegrationRow key={integration} kind={integration} params={this.props.match.params} />);
    const { classes } = this.props;

    return(
      <div className={classes.wrapper}>
        <div className={classes.button}>
         
        </div>
        <Card className={classes.card}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell>Kind</TableCell>
                  <TableCell style={{ textAlign: "right"}}>
                    <Link
                    to={`/dashboard/${this.props.match.params.organizationID}/applications/${this.props.match.params.applicationID}/integrations/create`}
                    className={classes.noStyle}
                    >
                    <Button className={classes.button} variant="raised">
                      <AddIcon />
                      Add integration
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{IntegrationRows}</TableBody>
          </Table>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(ApplicationIntegrations);
