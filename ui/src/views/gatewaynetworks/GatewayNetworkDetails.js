import React, { Component } from 'react';
import { withStyles } from "material-ui/styles";
import Card, { CardContent } from "material-ui/Card";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";
import Typography from "material-ui/Typography";

import GatewayNetworkStore from '../../stores/GatewayNetworkStore';

const styles = theme => ({
  card: {
    minHeight: 300,
    margin: "auto",
    justifyContent: "center",
    display: "flex",
    overflowY: "hidden"
  },
  cardContent: {
    flex: 1
  },
  wrapper: {
    maxWidth: 1280,
    width: "100%",
    margin: "auto"
  },
  map: {
    height: 450,
    width: 450
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  stats: {
    minWidth: 720,
    width: "100%",
  }
});

class GatewayNetworkDetails extends Component {
  constructor() {
    super();

    this.state = {
      gatewayNetwork: {},
    }
    
  }

  componentWillMount() {
    GatewayNetworkStore.getGatewayNetwork(this.props.match.params.organizationID, (gatewayNetwork) => {
      this.setState({
        gatewayNetwork: gatewayNetwork,
      });
    });
  }

  render() {
    const { classes } = this.props;

    let privateNetwork = "";
    
    if (!this.state.gatewayNetwork.private) {
      privateNetwork = "No";
    } else {
      privateNetwork = "Yes";
    }
    
    return(
      <div className={classes.wrapper}>
        <Card className={classes.card} >
          <CardContent>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell><Typography variant="headline">{this.state.gatewayNetwork.name}</Typography></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell>{this.state.gatewayNetwork.createdAt}</TableCell>  
                </TableRow>
                <TableRow>
                  <TableCell><strong>Updated At</strong></TableCell>
                  <TableCell>{this.state.gatewayNetwork.updatedAt}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell>{this.state.gatewayNetwork.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>GatewayNetwork ID</strong></TableCell>
                  <TableCell>{this.state.gatewayNetwork.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Organization ID</strong></TableCell>
                  <TableCell>{this.state.gatewayNetwork.organizationID}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Private Network</strong></TableCell>
                  <TableCell>{privateNetwork}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}


export default withStyles(styles)(GatewayNetworkDetails);
