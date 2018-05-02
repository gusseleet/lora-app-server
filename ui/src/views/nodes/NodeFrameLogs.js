import React, { Component } from "react";
import JSONTree from "react-json-tree";
import moment from "moment";
import fileDownload from "js-file-download";
import { withStyles } from "material-ui/styles";

import Card, { CardContent } from "material-ui/Card";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";
import Table, {
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";
import PauseIcon from "material-ui-icons/Pause";
import ResumeIcon from "material-ui-icons/PlayArrow";
import DeleteIcon from "material-ui-icons/Delete";
import DownloadIcon from "material-ui-icons/FileDownload";
import ArrowUp from "material-ui-icons/ArrowUpward";

import NodeStore from "../../stores/NodeStore";

const styles = theme => ({
  card: {
    width: "100%",
    maxWidth: 1280,
    minHeight: 300,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "hidden",
    flex: 1,
    flexDirection: 'column',
  },
  wrapper: {
    maxWidth: 1280,
    width: "100%",
    margin: "auto"
  },
  tableHead: {
    backgroundColor: "#F0F0F0"
  },
  disconnected: {
    padding: 4,
    backgroundColor: "red",
    borderRadius: 5,
    color: "white",
    fontSize: 12
  },
  connected: {
    padding: 4,
    backgroundColor: "green",
    borderRadius: 5,
    color: "white",
    fontSize: 12
  },
  treeStyle: {
    paddingTop:0,
    paddingBottom: 0,
  },
  hidden: {
    display: "none"
  }
});


class FrameRow extends Component {
  render() {
    const classes = this.props.classes;

    const theme = {
      scheme: 'google',
      author: 'seth wright (http://sethawright.com)',
      base00: '#1d1f21',
      base01: '#282a2e',
      base02: '#373b41',
      base03: '#969896',
      base04: '#b4b7b4',
      base05: '#c5c8c6',
      base06: '#e0e0e0',
      base07: '#ffffff',
      base08: '#CC342B',
      base09: '#F96A38',
      base0A: '#FBA922',
      base0B: '#198844',
      base0C: '#3971ED',
      base0D: '#3971ED',
      base0E: '#A36AC7',
      base0F: '#3971ED',
    }

    const data = {
      phyPayload: this.props.frame.phyPayload,
    };

    let rxtx = {};

    if (this.props.frame.uplinkMetaData !== undefined) {
      rxtx["uplink"] = this.props.frame.uplinkMetaData;
    }

    if (this.props.frame.downlinkMetaData !== undefined) {
      rxtx["downlink"] = this.props.frame.downlinkMetaData;
    }

    const receivedAt = moment(this.props.frame.receivedAt).format("LTS");

    return(
      <TableRow>
        <TableCell>
          <ArrowUp />
        </TableCell>
        <TableCell>{receivedAt}</TableCell>
        <TableCell className={classes.treeStyle}>
          <JSONTree data={rxtx} theme={theme} hideRoot={true} />
        </TableCell>
        <TableCell className={classes.treeStyle}>
          <JSONTree data={data} theme={theme} hideRoot={true} />
        </TableCell>
      </TableRow>
    );
  }
}


class NodeFrameLogs extends Component {
  constructor() {
    super();
    this.state = {
      wsConnected: false,
      frames: [],
      paused: false,
    };

    this.onConnected = this.onConnected.bind(this);
    this.onDisconnected = this.onDisconnected.bind(this);
    this.onFrame = this.onFrame.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.clearFrames = this.clearFrames.bind(this);
    this.download = this.download.bind(this);
  }

  togglePause() {
    this.setState({
      paused: !this.state.paused,
    });
  }

  clearFrames() {
    this.setState({
      frames: [],
    });
  }

  download() {
    const dl = this.state.frames.map((frame, i) => {
      return {
        uplinkMetaData: frame.uplinkMetaData,
        downlinkMetaData: frame.downlinkMetaData,
        phyPayload: frame.phyPayload,
      }
    });

    fileDownload(JSON.stringify(dl, null, 4), `device-${this.props.match.params.devEUI}.json`);
  }

  onConnected() {
    this.setState({
      wsConnected: true,
    });
  }

  onDisconnected() {
    this.setState({
      wsConnected: false,
    });
  }

  onFrame(frame) {
    if (this.state.paused) {
      return;
    }

    let frames = this.state.frames;
    const now = new Date();

    if (frame.uplinkFrames.length !== 0) {
      frames.unshift({
        id: now.getTime(),
        receivedAt: new Date(),
        uplinkMetaData: {
          rxInfo: frame.uplinkFrames[0].rxInfo,
          txInfo: frame.uplinkFrames[0].txInfo,
        },
        phyPayload: JSON.parse(frame.uplinkFrames[0].phyPayloadJSON),
      });
    }

    if (frame.downlinkFrames.length !== 0) {
      frames.unshift({
        id: now.getTime(),
        receivedAt: new Date(),
        downlinkMetaData: {
          txInfo: frame.downlinkFrames[0].txInfo,
        },
        phyPayload: JSON.parse(frame.downlinkFrames[0].phyPayloadJSON),
      });
    }

    this.setState({
      frames: frames,
    });
  }

  componentDidMount() {
    const conn = NodeStore.getFrameLogsConnection(this.props.match.params.devEUI, this.onConnected, this.onDisconnected, this.onFrame);
    this.setState({
      wsConn: conn,
    });
  }

  componentWillUnmount() {
    this.state.wsConn.close();
  }

  render() {
    const { classes } = this.props;
    const FrameRows = this.state.frames.map((frame, i) => <FrameRow classes={classes} key={frame.id} frame={frame} />);
    let status;

    if (this.state.wsConnected) {
      status = <span className={classes.connected}>connected</span>;
    } else {
      status = <span className={classes.disconnected}>disconnected</span>;
    }

    return (
      <div className={classes.wrapper}>
        <Card className={classes.card}>
          <CardContent>
            <Table>
              <TableHead>
                <TableCell>
                  <Typography variant="title">Live LoRaWAN frame logs {status}</Typography>
                </TableCell>
                <TableCell style={{textAlign: "right"}}>
                  <Button  className={`${this.state.paused ? classes.hidden : ''}`} onClick={this.togglePause}>
                    <PauseIcon />
                    Pause
                  </Button>
                  <Button className={`${this.state.paused ? '': classes.hidden}`} onClick={this.togglePause}>
                    <ResumeIcon />
                    Start
                  </Button>
                  <Button onClick={this.clearFrames}>
                    <DeleteIcon />
                    Clear logs
                  </Button>
                  <Button onClick={this.download}>
                    <DownloadIcon />
                    Download
                  </Button>
                </TableCell>
              </TableHead>
            </Table>
              <Table className={classes.table}>
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell  width={10}/>
                    <TableCell  width={100}>Received</TableCell>
                    <TableCell>RX / TX parameters</TableCell>
                    <TableCell>LoRaWAN PHYPayload</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FrameRows}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(NodeFrameLogs);
