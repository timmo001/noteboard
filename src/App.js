import React from 'react';
import moment from 'moment';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import pink from '@material-ui/core/colors/pink';
import clone from './Components/Common/clone';
import mapToColor from './Components/Common/mapToColor';
import Root from './Components/Root';
import 'typeface-roboto';
import '@mdi/font/css/materialdesignicons.min.css';
import './App.css';

var themes = [
  {
    id: 1,
    name: 'Light',
    palette: {
      type: 'light',
      primary: blueGrey,
      secondary: grey,
      background: grey[100],
      card: grey[200],
      error: red
    }
  },
  {
    id: 2,
    name: 'Dark',
    palette: {
      type: 'dark',
      primary: blueGrey,
      secondary: grey,
      background: grey[900],
      card: grey[800],
      error: red
    }
  },
  {
    id: 3,
    name: 'Midnight',
    palette: {
      type: 'dark',
      primary: pink,
      secondary: pink,
      background: '#383c45',
      card: grey[800],
      error: red
    }
  }
];

const defaultPalette =
  moment().hour >= 22 || moment().hour <= 4
    ? createMuiTheme({ palette: themes[1].palette })
    : createMuiTheme({ palette: themes[0].palette });

class App extends React.PureComponent {
  state = {
    theme: defaultPalette
  };

  setTheme = id =>
    this.setState({
      theme: createMuiTheme({
        palette: id ? themes[id].palette : themes[0].palette
      })
    });

  addTheme = theme => {
    const base = themes.find(
      t => t.name.toLowerCase() === theme.base.toLowerCase()
    );
    var newTheme = clone(themes[0]);
    if (base) newTheme = clone(base);
    newTheme.id = themes[themes.length - 1].id + 1;
    newTheme.name = theme.name;
    if (theme.overrides) {
      if (theme.overrides.type) newTheme.palette.type = theme.overrides.type;
      if (theme.overrides.primary)
        newTheme.palette.primary = mapToColor(theme.overrides.primary);
      if (theme.overrides.secondary)
        newTheme.palette.secondary = mapToColor(theme.overrides.secondary);
      if (theme.overrides.background)
        newTheme.palette.background = mapToColor(theme.overrides.secondary);
    }
    themes.push(newTheme);
  };

  render() {
    const { theme } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <Root
          themes={themes}
          theme={theme}
          setTheme={this.setTheme}
          addTheme={this.addTheme}
        />
      </MuiThemeProvider>
    );
  }
}

export default App;
