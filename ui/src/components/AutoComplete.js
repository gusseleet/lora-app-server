import React, { Component } from 'react'
import Downshift from 'downshift'
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 250,
    },
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    inputRoot: {
        flexWrap: 'wrap',
    },
});

class AutoComplete extends Component {
    renderInput(inputProps) {
        const { InputProps, classes, ref, ...other } = inputProps;
      
        return (
          <TextField
            InputProps={{
              inputRef: ref,
              classes: {
                root: classes.inputRoot,
              },
              ...InputProps,
            }}
            {...other}
          />
        );
    }

    renderItem({ item, index, itemProps, highlightedIndex, selectedItem }) {
        const isHighlighted = highlightedIndex === index;
        const isSelected = (selectedItem || '').indexOf(item.username) > -1;

        return (
            <MenuItem
                {...itemProps}
                key={item.id}
                selected={isHighlighted}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400,
                }}
            >
                {item.username}
            </MenuItem>
        );
    }

    getItems(inputValue) {
        let count = 0;
        return this.props.items.filter(item => {
            const keep =
            (!inputValue || item.username.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) &&
            count < 5;
        
            if (keep) {
                count += 1;
            }
        
            return keep;
        });
    }

    render() {
        const { onChange, classes } = this.props;

        return (
            <Downshift
            itemToString={item => item ? `${item.username}` : ''}

        onChange={onChange}
        render={({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            selectedItem,
            highlightedIndex,
        }) => (
            <div>
                {this.renderInput({
                    fullWidth: true,
                    classes,
                    InputProps: getInputProps({
                        placeholder: 'Enter username here',
                        id: 'integration-downshift-simple',
                        onChange: this.props.didWrite(this),
                    }),
                })}            
                {isOpen ? (
                    <Paper className={classes.paper} square>
                        {this.getItems(inputValue).map((item, index) =>
                            this.renderItem({
                                item,
                                index,
                                itemProps: getItemProps({ item }),
                                highlightedIndex,
                                selectedItem,
                            }),
                        )}
                    </Paper>
                ) : null}
            </div>
        )}
        />
        );
    }
}

export default withStyles(styles)(AutoComplete);