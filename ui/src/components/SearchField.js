import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Search from "material-ui-icons/Search";
import { withStyles } from "material-ui/styles";

const defaultStyle = {
    outsideContainer: {
      width: '100%',
      height: '70%',
    },
    insideContainer: {
      marginTop: 0,
			height: '100%',
			alignItems: 'center',
    },
    inputBox: {
      flexGrow: 1,
    },
    input: {
      width: '100%',
      border: 0,
      '&:focus': {
        outline: 0,
			},
    },
    iconContainer: {
			marginLeft: 8,
      paddingRight: 0,
    },
};

class SearchField extends Component {

    render() {
        const {classes} = this.props;
        
        return (
            <Paper className={classes.outsideContainer}>
                <Grid container align="center" className={classes.insideContainer}>
                    <Grid item className={classes.iconContainer}>
                        <Search />
                    </Grid>
                    <Grid item className={classes.inputBox}>
                        <input
                            type="text"
                            className={classes.input}
                            placeholder={this.props.placeholder}
                            onChange={this.props.onChange.bind(this)}
                            value={this.props.value || ""}
                        />
                    </Grid>
                </Grid>
            </Paper>  
        );
    }
}

export default withStyles(defaultStyle)(SearchField);

