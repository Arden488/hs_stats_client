import React, { Component } from 'react';
import { Query, compose, graphql } from 'react-apollo';
import './App.css';
import Decks from './components/Decks';
import getActiveDeck from './graphql/getActiveDeck';
import { Link } from 'react-router-dom'
import getAllWinrates from './graphql/getAllWinrates';

class App extends Component {
  outputTotalWinrate(winrates) {
    let games = 0;
    let wins = 0;
    let losses = 0;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
      losses += wr.losses;
    });

    const winrate = `${((wins/games) * 100).toFixed(2)}%`;

    return (
      <div>
        <p>Total games played: {games}</p>
        <p>Total wins: {wins}</p>
        <p>Total losses: {losses}</p>
        <p>Total winrate: {winrate}</p>
      </div>
    )
  }

  showActiveDeck(deck) {
    if (!deck.name) return <Decks />

    return (
      <div>
        <h2>{deck.name}</h2>
        <img src={deck.heroImage} alt={deck.name} />
        <Query query={getAllWinrates}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error}</p>;

            return this.outputTotalWinrate(data.allWinrates);
          }}
        </Query>
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
