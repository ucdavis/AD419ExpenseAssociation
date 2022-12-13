import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';

import AssociationContainer from './components/associations/AssociationContainer';
import SummaryContainer from './components/summary/SummaryContainer';
import ExpensesContainer from './components/expenses/ExpensesContainer';
import Access from './Access';

import './sass/custom.scss';

export default class App extends Component {
  static displayName = App.name;

  render(): JSX.Element {
    return (
      <Layout>
        <Route exact path='/' component={AssociationContainer} />
        <Route path='/summary' component={SummaryContainer} />
        <Route path='/expenses' component={ExpensesContainer} />
        <Route path='/access' component={Access} />
      </Layout>
    );
  }
}
