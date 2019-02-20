import React, { Component } from 'react';
import { Query, compose, graphql } from 'react-apollo';
import { Link } from 'react-router-dom'

import Decks from './components/Decks';

import getActiveDeck from './graphql/getActiveDeck';
import getCurrentSession from './graphql/getCurrentSession';
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
  grid-template-columns: 30% 400px;
  
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

    const session = this.props.currentSession;

    const sessGames = session.wins + session.losses;
    const winrate = `${(((wins+session.wins)/(games+sessGames)) * 100).toFixed(2)}%`;
    const sessWinrate = sessGames > 0 ? `${((session.wins/(sessGames)) * 100).toFixed(2)}%` : 'N/A';

    return (
      <div>
        <h2>{deck.name}</h2>

        <h3>Total:</h3>
        <div>
          <StatsBlock><span>{games + sessGames}</span>games</StatsBlock>
          <StatsBlock><span>{wins + session.wins}</span>wins</StatsBlock>
          <StatsBlock><span>{losses + session.losses}</span>losses</StatsBlock>
          <StatsBlock><span>{winrate}</span>winrate</StatsBlock>
        </div>
        <hr />
        <h3>Current session:</h3>
        <div>
          <StatsBlock><span>{sessGames}</span>games</StatsBlock>
          <StatsBlock><span>{session.wins}</span>wins</StatsBlock>
          <StatsBlock><span>{session.losses}</span>losses</StatsBlock>
          <StatsBlock><span>{sessWinrate}</span>winrate</StatsBlock>
        </div>

        <p>
          <Link to="/new-game"><LargeButton primary>New Game</LargeButton></Link>
        </p>
      </div>
    )
  }

  showActiveDeck(deck) {
    return (
      <ActiveDeck>
        <MainContent>
          <img src={deck.heroImage} alt={deck.name} />
        </MainContent>
        <Aside>
          <Query query={getAllWinrates} variables={{ deckId: deck.id }}>
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

    if (!activeDeck.name) return <Decks />;

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
  }),
  graphql(getCurrentSession, {
    props: ({ data: { currentSession } }) => ({
      currentSession
    })
  }),
)(App);
