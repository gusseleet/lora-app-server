import React from "react";
import Select from "material-ui/Select";
import { withStyles } from "material-ui/styles";
import { MenuItem } from "material-ui/Menu";

const styles = theme => ({});

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ open: props.open });
  }

  handleClose = () => {
    this.setState({ open: false });
  };
  handleOpen = () => {
    this.setState({ open: true });
  };

  render() {
    let { value, options } = this.props;
    if (value === undefined) {
      value = "undefined";
    }

    let items = [];

    if (options !== undefined) {
      items = this.props.options.map(option => {
        return (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        );
      });
    }

    return (
      <Select
        disableUnderline={this.props.disabledUnderline}
        open={this.state.open}
        onClose={this.handleClose}
        onOpen={this.handleOpen}
        value={value}
        onChange={this.props.onChange}
      >
        {items}
      </Select>
    );
  }
}

export default withStyles(styles)(Dropdown);
