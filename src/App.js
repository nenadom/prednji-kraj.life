import React, { Component } from "react";
import GoogleAnalytics from "react-ga";
import { BrowserRouter, Route } from "react-router-dom";
import ListPage from "./ListPage";
import RunPage from "./RunPage";
import config from "./config";
import { handleError } from "./utils";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    if (config.GOOGLE_ANALYTICS_CODE) {
      GoogleAnalytics.initialize(config.GOOGLE_ANALYTICS_CODE);
    }
  }

  render() {
    return <RunPage />;
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    handleError(error, errorInfo);
  }

  recordPageview = ({ location }) => {
    GoogleAnalytics.pageview(location.pathname);
    return null;
  };
}

export default App;
