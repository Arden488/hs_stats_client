import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import NewGame from './components/NewGame';
import ArchetypesList from './components/ArchetypesList';
import OppDecksList from './components/OppDecksList';
import Stats from './components/Stats';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Wrapper } from './styles/layouts';

/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update');
  whyDidYouUpdate(React, {
    exclude: [
      /^Route/,
    ]
  });
}
*/

const defaults = {
  activeDeck: {
    __typename: 'ActiveDeck',
    id: null,
    name: null,
    heroImage: null
    // heroImage: "https://art.hearthstonejson.com/v1/render/latest/enUS/256x/HERO_05.png",
    // id: "5c72eb06fb6fc072012797db",
    // name: "Midrange hunter (2 hounds)"
  },
  currentGame: {
    __typename: 'CurrentGame',
    opponentClass: null,
    opponentDeck: null,
    mulligan: [],
    outcome: null
    // mulligan: [
    //   {cardId: "UNG_915", cardName: "Crackling Razormaw", __typename: "Card"},
    //   {cardId: "UNG_915", cardName: "Crackling Razormaw", __typename: "Card"},
    //   {cardId: "EX1_531", cardName: "Scavenging Hyena", __typename: "Card"},
    //   {cardId: "EX1_531", cardName: "Scavenging Hyena", __typename: "Card"}
    // ],
    // opponentClass: "hunter",
    // opponentDeck: null,
    // outcome: null
  },
  currentSession: {
    __typename: 'CurrentSession',
    wins: 0,
    losses: 0
  }
};

const resolvers = {
  Mutation: {
    resetGame: (_, d, { cache }) => {
      cache.writeData({ data : { currentGame : defaults.currentGame } })
      return null;
    },
    updateActiveDeck: (_, { id, name, heroImage }, { cache }) => {
      cache.writeData({ data: { activeDeck: { id, name, heroImage, __typename: 'ActiveDeck' } } });
      return null;
    },
    updateCurrentSession: (_, { wins, losses }, { cache }) => {
      cache.writeData({ data: { currentSession: { wins, losses, __typename: 'ActiveDeck' } } });
      return null;
    },
    updateGameOpponentClass: (_, { opponentClass }, { cache }) => {
      cache.writeData({ data: { currentGame: { opponentClass, __typename: 'CurrentGame' } } });
      return null;
    },
    updateGameMulligan: (_, { mulligan }, { cache }) => {
      cache.writeData({ data: { currentGame: { mulligan, __typename: 'CurrentGame' } } });
      return null;
    },
    updateGameOpponentDeck: (_, { opponentDeck }, { cache }) => {
      cache.writeData({ data: { currentGame: { opponentDeck, __typename: 'CurrentGame' } } });
      return null;
    },
    updateGameOutcome: (_, { outcome }, { cache }) => {
      cache.writeData({ data: { currentGame: { outcome, __typename: 'CurrentGame' } } })
      return null;
    }
  }
}

const typeDefs = `
  type Card {
    cardId: String!,
    cardName: String!
  }
`;

const client = new ApolloClient({
  clientState: {
    defaults,
    resolvers,
    typeDefs
  },
  uri: 'https://hs-stats-server.herokuapp.com/graphql'
  // uri: 'http://localhost:3333/graphql'
});

const render = Component => {
  return ReactDOM.render(
    <ApolloProvider client={client}>
      <Router>
        <Wrapper>
          <Route exact path="/" component={App} />
          <Route path="/new-game" component={NewGame} />
          <Route path="/stats" component={Stats} />
          <Route path="/archs-list" component={ArchetypesList} />
          <Route path="/decks-list" component={OppDecksList} />
        </Wrapper>
      </Router>
    </ApolloProvider>, 
    document.getElementById('root')
  );
};

render(App);

serviceWorker.unregister();
