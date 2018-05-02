import { createMuiTheme } from 'material-ui/styles';
import grey from 'material-ui/colors/grey';
import red from 'material-ui/colors/red';

const theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: grey,
        secondary: red,
        error: red,
    }
});

export default theme;
