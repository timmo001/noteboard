import React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import blueGrey from "@material-ui/core/colors/blueGrey";
import grey from "@material-ui/core/colors/grey";
import red from "@material-ui/core/colors/red";
import orange from "@material-ui/core/colors/orange";
import blue from "@material-ui/core/colors/blue";
import Root from "./Components/Root";
import "typeface-roboto";
import "@mdi/font/css/materialdesignicons.min.css";
import "./App.css";

var theme = createMuiTheme({
  palette: {
    type: "light",
    primary: blueGrey,
    secondary: grey,
    backgrounds: {
      main: grey[100],
      default: grey[200],
      navigation: grey[300],
      card: {
        on: blueGrey[300],
        off: grey[300],
        disabled: grey[200],
        alarm: {
          home: blueGrey[300],
          away: blueGrey[300],
          triggered: red[400]
        },
        climate: {
          heat: orange[300],
          cool: blue[300]
        }
      }
    },
    text: {
      light: grey[700],
      main: grey[800],
      icon: grey[700]
    },
    error: red
  }
});

class App extends React.PureComponent {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Root theme={theme} />
      </MuiThemeProvider>
    );
  }
}

export default App;
