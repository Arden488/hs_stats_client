import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import './App.css';
import Decks from './components/Decks';
import getActiveDeck from './graphql/getActiveDeck';
import { Link } from 'react-router-dom'

class App extends Component {
  showActiveDeck(deck) {
    if (!deck.name) return <Decks />

    return (
      <div>
        <h2>{deck.name}</h2>
        <img src={deck.heroImage} alt={deck.name} />
        <p>
          <Link to="/new-game">New Game</Link>
        </p>
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
