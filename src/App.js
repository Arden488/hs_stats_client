import React, { Component } from 'react';
import { Query, compose, graphql } from 'react-apollo';
import './App.css';
import Decks from './components/Decks';
import getActiveDeck from './graphql/getActiveDeck';
import { Link } from 'react-router-dom'
import getAllWinrates from './graphql/getAllWinrates';
import styled from 'styled-components'
import { LargeButton } from './styles/buttons';

const ActiveDeck = styled.section`
  display: grid;
  grid-template-columns: 40% 70%;
  
  @media (max-width: 667px) {
    grid-template-columns: auto
  }
`;

const MainContent = styled.article`
  text-align: center;
  
  img {
    max-width: 100%;
  }

  @media (max-width: 667px) {
    text-align: center;

    img {
      max-height: 200px;
    }
  }
`;

const Aside = styled.aside`
  @media (max-width: 667px) {
    text-align: center;
  }
`;

class App extends Component {
  outputTotalWinrate(deck, winrates) {
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
        <h2>{deck.name}</h2>

        <p>Total games played: {games}</p>
        <p>Total wins: {wins}</p>
        <p>Total losses: {losses}</p>
        <p>Total winrate: {winrate}</p>

        <p>
          <Link to="/new-game"><LargeButton primary>New Game</LargeButton></Link>
        </p>
      </div>
    )
  }

  showActiveDeck(deck) {
    if (!deck.name) return <Decks />

    return (
      <ActiveDeck>
        <MainContent>
          <img src={deck.heroImage} alt={deck.name} />
        </MainContent>
        <Aside>
          <Query query={getAllWinrates}>
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error: {error}</p>;

              return this.outputTotalWinrate(deck, data.allWinrates);
            }}
          </Query>
        </Aside>
      </ActiveDeck>
    )
  }

  render() {
    const { activeDeck } = this.props;

    return (
      <div>
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
