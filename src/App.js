import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import pink from '@material-ui/core/colors/pink';
import clone from './Components/Common/clone';
import mapToColor from './Components/Common/mapToColor';
import Root from './Components/Root';
import corkboard from './resources/corkboard.png';
import 'typeface-roboto';
import '@mdi/font/css/materialdesignicons.min.css';
import './App.css';

var themes = [
  {
    id: 10,
    name: 'Midnight',
    palette: {
      type: 'dark',
      primary: pink,
      secondary: pink,
      background: '#2c3039',
      main: '#2c3039',
      error: red
    }
  },
  {
    id: 20,
    name: 'Light',
    palette: {
      type: 'light',
      primary: blueGrey,
      secondary: grey,
      background: grey[100],
      main: grey[200],
      error: red
    }
  },
  {
    id: 30,
    name: 'Corkboard',
    palette: {
      type: 'dark',
      primary: amber,
      secondary: amber,
      background: `url(${corkboard}) 0px repeat`,
      main: grey[800],
      error: red
    }
  }
];

const defaultPalette = createMuiTheme({
  palette: themes[0].palette,
  typography: { useNextVariants: true }
});

class App extends React.PureComponent {
  state = {
    theme: defaultPalette
  };

  setTheme = id => {
    id = Number(id);
    let theme = themes.find(t => t.id === id);
    console.log(id, theme);
    if (!theme) theme = themes[0];
    // console.log(id, theme);
    this.setState({
      theme: createMuiTheme({
        palette: theme.palette,
        typography: { useNextVariants: true }
      })
    });
    localStorage.setItem('theme', id);
  };

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
