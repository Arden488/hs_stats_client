import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const defaults = {
  activeDeck: {
    __typename: 'ActiveDeck',
    name: null
  }
};

const resolvers = {
  Mutation: {
    updateActiveDeck: (_, { id, name }, { cache }) => {
      cache.writeData({ data: { activeDeck: { id, name, __typename: 'ActiveDeck' } } });
      return null;
    },
  }
}

const client = new ApolloClient({
  clientState: {
    defaults,
    resolvers
  },
  uri: "http://localhost:3333/graphql"
});

const render = Component => {
  return ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>, 
    document.getElementById('root')
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render(NextApp);
  })
}

serviceWorker.unregister();
