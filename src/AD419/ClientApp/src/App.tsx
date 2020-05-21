import React, { Component } from "react";
import { Route } from "react-router";
import { Layout } from "./components/Layout";

import AssociationContainer from "./components/associations/AssociationContainer";

import "./custom.css";

export default class App extends Component {
  static displayName = App.name;

  render(): JSX.Element {
    return (
      <Layout>
        <Route exact path="/" component={AssociationContainer} />
      </Layout>
    );
  }
}
