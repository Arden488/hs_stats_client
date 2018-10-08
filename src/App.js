import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import './App.css';
import Decks from './components/Decks';
import getActiveDeck from './graphql/getActiveDeck';

class App extends Component {
  showActiveDeck(deck) {
    if (!deck.name) return <Decks />

    return (
      <div>
        {deck.name}
      </div>
    )
  }

  render() {
    const { activeDeck } = this.props;

    return (
      <div className="App">
        {this.showActiveDeck(activeDeck)}
      </div>
    );
  }
}

export default compose(
  graphql(getActiveDeck, {
    props: ({ data: { activeDeck } }) => ({
        activeDeck
    })
  })
)(App);
