import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';

import AssociationContainer from './components/associations/AssociationContainer';
import { UserAdministration } from './components/authorization/UserAdministration';

import './sass/custom.scss'

export default class App extends Component {
  static displayName = App.name;

  render(): JSX.Element {
    return (
      <Layout>
        <Route exact path='/' component={AssociationContainer} />
        <Route path='/useradministration' component={UserAdministration} />
      </Layout>
    );
  }
}
