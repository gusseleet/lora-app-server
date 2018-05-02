import React, { Component } from 'react';
import { TablePagination } from 'material-ui/Table';
import { withStyles } from 'material-ui/styles';
import { withRouter, Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import FirstPageIcon from 'material-ui-icons/FirstPage';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import LastPageIcon from 'material-ui-icons/LastPage';
const actionsStyles = theme => ({
    root: {
      flexShrink: 0,
      color: theme.palette.text.secondary,
      marginLeft: theme.spacing.unit * 2.5,
    },
});

class TablePaginationActions extends Component {
    render() {
        const { classes, count, page, rowsPerPage, theme, pathname } = this.props;
        return (
            <div className={classes.root}>
            <IconButton
            component={Link}
            to={`${pathname}?page=${1}`}
            disabled={page === 1}
            aria-label="First Page"
            >
            {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
            component={Link}
            to={`${pathname}?page=${page-1}`}
            disabled={page === 1}
            aria-label="Previous Page"
            >
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
            component={Link}
            to={`${pathname}?page=${page+1}`}
            disabled={page >= Math.ceil(count / rowsPerPage)}
            aria-label="Next Page"
            >
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
            component={Link}
            to={`${pathname}?page=${Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage))}`}
            disabled={page >= Math.ceil(count / rowsPerPage)}
            aria-label="Last Page"
            >
            {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
            </div>
        );
    }
}

class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleChangePage = (event, pageNumber) => {
    };
    
    
    render() {
        const actions = TablePaginationActions;
        actions.defaultProps = { pathname: this.props.pathname }

        const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
            actions,
        );

        const fromNumber = this.props.rowsPerPage * this.props.page+1
        const toNumber = fromNumber + this.props.rowsPerPage <= this.props.count 
            ? fromNumber + this.props.rowsPerPage - 1
            : this.props.count
            
        return (
            <TablePagination
                colSpan={this.props.colSpan}
                count={this.props.count}
                labelDisplayedRows={({count}) => `${fromNumber}-${toNumber} of ${count}`}
                rowsPerPage={this.props.rowsPerPage}
                page={this.props.page+1}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.props.onChangeRowsPerPage}
                Actions={TablePaginationActionsWrapped}
            />
        );
    }
}

export default withRouter(Pagination);
