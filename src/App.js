import React, { Component } from 'react';
import { Query, compose, graphql } from 'react-apollo';
import { Link } from 'react-router-dom'

import Decks from './components/Decks';
import ArchetypesList from './components/ArchetypesList';

import getActiveDeck from './graphql/getActiveDeck';
import getAllWinrates from './graphql/getAllWinrates';

import './App.css';
import styled from 'styled-components'
import { LargeButton, Button } from './styles/buttons';
import { fonts, spacers } from './styles/vars';

const StatsBlock = styled.div`
  display: inline-block;
  text-transform: uppercase;
  font-size: ${fonts.extraSmallSize};
  margin-right: ${spacers.baseSpacer * 4}px;

  span {
    display: block;
    font-size: ${fonts.extraLargeSize}
  }
`;

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

        <StatsBlock><span>{games}</span>games</StatsBlock>
        <StatsBlock><span>{wins}</span>wins</StatsBlock>
        <StatsBlock><span>{losses}</span>losses</StatsBlock>
        <StatsBlock><span>{winrate}</span>winrate</StatsBlock>

        <p>
          <Link to="/new-game"><LargeButton primary>New Game</LargeButton></Link>
        </p>
      </div>
    )
  }

  showActiveDeck(deck) {
    if (!deck.name) return <Decks />;

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
          <p>
            <Link to="/decks-list"><Button>Show Decks</Button></Link>
            &nbsp;
            <Link to="/archs-list"><Button>Show Archetypes</Button></Link>
          </p>
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
