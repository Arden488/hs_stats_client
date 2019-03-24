import React, { Component } from 'react';
import { Query, compose, graphql } from 'react-apollo';
import { Link } from 'react-router-dom'

import Decks from './components/Decks';
import Fireworks from './components/Fireworks';

import getActiveDeck from './graphql/getActiveDeck';
import getAllWinrates from './graphql/getAllWinrates';

import './App.css';
import styled from 'styled-components'
import { LargeButton, Button } from './styles/buttons';
import { fonts, spacers, colors, borders } from './styles/vars';
import { getWinrateColor } from './helpers/misc_utils';
import CalcGamesToLegend from './components/CalcGamesToLegend';

const StatsBlock = styled.div`
  display: inline-block;
  text-transform: uppercase;
  font-size: ${fonts.extraSmallSize};
  margin-right: ${spacers.baseSpacer * 4}px;

  span {
    display: block;
    font-size: ${fonts.extraLargeSize};
    color: ${props => props.color || colors.text};
  }
`;

const StarButton = styled.button`
  display: block;
  border: 0;
  background: ${colors.third};
  width: 40px;
  height: 25px;
  border-radius: ${borders.borderRadius};
  margin-top: 7px;
  color: ${colors.text};
  font-size: ${fonts.size};
  cursor: pointer;
`;

const ActiveDeck = styled.section`
  display: grid;
  grid-template-columns: 30% auto;
  
  @media (max-width: 667px) {
    grid-template-columns: auto
  }
`;

const TotalStatsBox = styled.div`
  disply: inline-block;
  padding-bottom: 20px;
  border-bottom: 1px solid ${colors.elementsBg};
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
  constructor(props) {
    super(props);

    this.state = {
      level: 5,
      stars: 0,
      totalLosses: 0,
      totalWins: 0,
      initFireworks: false
    }
  }

  componentDidMount() {
    this.setState({
      level: parseInt(localStorage.getItem('level')) || 5,
      stars: parseInt(localStorage.getItem('stars')) || 0
    })
  }

  getCurrentSession() {
    const dateObj = new Date();
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();

    const today = dd + '.' + mm + '.' + yyyy;

    const storeForDate = localStorage.getItem(today);
    let newStore;

    if (storeForDate === null) {
      newStore = { wins: 0, losses: 0 };
    } else {
      newStore = JSON.parse( storeForDate );
    }

    localStorage.setItem(today, JSON.stringify(newStore) );

    return newStore;
  }

  outputTotalWinrate(deck, winrates) {
    let games = this.state.totalLosses + this.state.totalWins;
    let wins = this.state.totalWins;
    let losses = this.state.totalLosses;

    if (games === 0) {
      winrates.forEach(wr => {
        // games += wr.games;
        wins += wr.wins;
        losses += wr.losses;
      });

      this.setState({
        totalLosses: losses,
        totalWins: wins
      })
    }

    const session = this.getCurrentSession();

    const sessGames = session.wins + session.losses;
    const winrate = (((wins)/(games)) * 100).toFixed(2);
    const sessWinrate = sessGames > 0 ? ((session.wins/(sessGames)) * 100).toFixed(2) : 'N/A';

    const starsToLegend = ((this.state.level - 1) * 5) + 5 - this.state.stars + 1;

    return (
      <div>
        <Fireworks init={this.state.initFireworks} />

        <h2>{deck.name}</h2>

        <h3>Total:</h3>
        <TotalStatsBox>
          <StatsBlock><span>{games}</span>games</StatsBlock>
          <StatsBlock><span>{wins}</span>wins</StatsBlock>
          <StatsBlock><span>{losses}</span>losses</StatsBlock>
          <StatsBlock color={getWinrateColor(winrate)}><span>{winrate}%</span>winrate</StatsBlock>
        </TotalStatsBox>

        <h3>Today session:</h3>
        <div>
          <StatsBlock><span>{sessGames}</span>games</StatsBlock>
          <StatsBlock><span>{session.wins}</span>wins</StatsBlock>
          <StatsBlock><span>{session.losses}</span>losses</StatsBlock>
          <StatsBlock color={getWinrateColor(sessWinrate)}><span>{sessWinrate}%</span>winrate</StatsBlock>
        </div>

        <h3>To legend:</h3>
        <div>
          <StatsBlock><span>{this.state.level}</span> level</StatsBlock>
          <StatsBlock><span>{this.state.stars}</span> stars</StatsBlock>
          <StatsBlock>
            <StarButton onClick={() => this.changeStars('up')}>+</StarButton>
            <StarButton onClick={() => this.changeStars('down')}>-</StarButton>
          </StatsBlock>
          <StatsBlock><span>{starsToLegend}</span> stars to legend</StatsBlock>
          <CalcGamesToLegend starsToLegend={starsToLegend} rank={this.state.level} stars={this.state.stars} winrate={winrate} />
        </div>

        <p>
          <Link to="/new-game"><LargeButton primary>New Game</LargeButton></Link>
        </p>
      </div>
    )
  }

  changeLevel(dir) {
    if (dir === 'up') {
      if (this.state.level > 1) {
        this.setState({
          level: this.state.level - 1,
          stars: 1
        })
        localStorage.setItem('level', this.state.level - 1);
        localStorage.setItem('stars', 1)
      } else {
        // alert('Legend!!!!');
        this.setState({
          initFireworks: true
        })
      }
    } else if (dir === 'down') {
      if (this.state.level < 5) {
        this.setState({
          level: this.state.level + 1,
          stars: 4
        })
        localStorage.setItem('level', this.state.level + 1);
        localStorage.setItem('stars', 4)
      }
    }
  }

  changeStars(dir) {
    if (dir === 'up') {
      if (this.state.stars < 5) {
        this.setState({
          stars: this.state.stars + 1
        })
        localStorage.setItem('stars', this.state.stars + 1)
      } else {
        this.changeLevel('up');
      }
    } else if (dir === 'down') {
      if (this.state.stars > 0) {
        this.setState({
          stars: this.state.stars - 1
        })
        localStorage.setItem('stars', this.state.stars - 1)
      } else {
        this.changeLevel('down');
      }
    }
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
            &nbsp;
            <Link to="/stats"><Button>Show Stats</Button></Link>
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
  })
)(App);
