import React from 'react';
import { withRouter, Redirect } from "react-router-dom";

import { Query, compose, graphql } from 'react-apollo';
import getActiveDeck from '../graphql/getActiveDeck';

import {
  sortBy as _sortBy,
  groupBy as _groupBy
} from 'lodash';

import styled from 'styled-components'
import getAllWinrates from '../graphql/getAllWinrates';
import { colors, fonts } from '../styles/vars';
import { getWinrateColor } from '../helpers/misc_utils';
import { getHeroByName } from '../helpers/hero_classes';

const StatsContainer = styled.section`
  main {
    display: grid;
    grid-template-columns: minmax(200px, 1fr) 3fr;
    align-items: start;
  }
`;

const DeckWinrate = styled.p`
  span {
    color: ${props => props.color || colors.text};
  }
`;

const Deck = styled.div`
  border: 0;
  background: none;
  cursor: pointer;
  text-align: center;
  color: ${colors.text}

  p {
    margin: 0;
    padding: 0;
  }
`;

const ListOfClasses = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-row-gap: 30px;
  grid-column-gap: 30px;
`;

const ClassStats = styled.div`
  img {
    max-height: 200px;
  }
`;

const DeckStats = styled.div`
  margin-bottom: 3px;
  position: relative;
  height: 40px;
`;

const DeckStatsName = styled.span`
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 14px;
`;

const DeckStatsWinrate = styled.span`
  position: absolute;
  right: 5px;
  top: 50%;
  font-size: ${fonts.smallSize};
  transform: translateY(-50%);
`;

const DeckStatsNum = styled.span`
  font-size: 10px;
  left: 5px;
  position: absolute;
  top: 20px;
`;

const DeckStatsMeter = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
  opacity: 0.5;
  width: ${props => props.games / props.total * 100 }%;
  background-color: ${props => getWinrateColor(props.winrate) };
`;

const ClassStatsTotal = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
`;

// const Winrate = styled.span`
//   color: ${props => props.color || colors.text};
// `;

const StatsBlock = styled.div`
  text-transform: uppercase;
  font-size: ${fonts.extraSmallSize};
  display: grid;
  grid-template-columns: 65% 30%;
  grid-column-gap: 5%;
  align-items: center;

  span {
    display: block;
    font-size: 26px;
    text-align: right;
    color: ${props => props.color || colors.text};
  }
`;

const StatsBlockContainer = styled.div`
  margin-top: 50px;
`;

// const EffectiveWinrate = styled(Winrate);

class Stats extends React.Component {
  showItem(arch, name, index, totals) {
    const wins = arch.reduce((acc, val) => { return acc + val.wins }, 0);
    const losses = arch.reduce((acc, val) => { return acc + val.losses }, 0);
    const games = wins + losses;
    const winrate = `${(((wins)/(games)) * 100).toFixed(2)}%`;
    const totalClassGames = totals.wins + totals.losses;

    return (
      <DeckStats key={name+index}>
        <DeckStatsName>{name}</DeckStatsName>
        <DeckStatsWinrate>WR: {winrate}</DeckStatsWinrate>
        <DeckStatsNum>{wins} wins in {games} games</DeckStatsNum>
        <DeckStatsMeter games={games} total={totalClassGames} winrate={winrate} />
      </DeckStats>
    )
  }

  showStats(data, deckTotals) {
    const classGroups = _groupBy(data, (v) => {
      return v.opponentClass
    });

    return Object.keys(classGroups).map(key => {
      const charClass = key;
      let decks = classGroups[key];
      const out = [];

      const charStats = {
        wins: decks.reduce((acc, val) => { return acc + val.wins }, 0),
        losses: decks.reduce((acc, val) => { return acc + val.losses }, 0)
      }

      decks = _sortBy(decks, o => {
        return o.wins + o.losses;
      }).reverse();

      decks.forEach(s => {
        out.push({
          'name': s.opponentDeckId === null ? 'Unknown' : s.opponentDeckId.name,
          'wins': s.wins,
          'losses': s.losses,
          'games': s.games
        })
      })
      
      let processedData = _groupBy(out, (v) => {
        return v.name
      })
      
      const heroImage = getHeroByName(charClass).heroImage;
      const totalGames = charStats.wins + charStats.losses;
      const totalWinrate = (((charStats.wins)/(totalGames)) * 100).toFixed(2);
      const effectiveWinrate = '?'//(((charStats.wins)/(deckTotals.wins)) * 100).toFixed(2);

      return (
        <ClassStats key={charClass}>
          <ClassStatsTotal>
            <img src={heroImage} alt={charClass} />
            <StatsBlockContainer>
              <StatsBlock><span>{totalGames}</span>total games</StatsBlock>
              <StatsBlock color={getWinrateColor(totalWinrate)}><span>{totalWinrate}%</span>winrate</StatsBlock>
              <StatsBlock color={getWinrateColor(effectiveWinrate)}><span>{effectiveWinrate}%</span>effective winrate</StatsBlock>
            </StatsBlockContainer>
          </ClassStatsTotal>
          {Object.keys(processedData).map((key, i) => {
            return this.showItem(processedData[key], key, i, charStats) 
          })}
        </ClassStats>
      )
    })
  }

  calculateTotals(data) {
    let games = 0;
    let wins = 0;

    data.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
    });

    const winrate = ( (wins/games) * 100 ).toFixed(2);

    return {
      wins,
      games,
      winrate
    }
  }

  render() {
    if (!this.props.activeDeck.name) {
      return <div><Redirect to={`/`} /></div>;
    }

    const deck = this.props.activeDeck;

    return (
      <Query 
        query={getAllWinrates} 
        variables={{ deckId: deck.id }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

          const totals = this.calculateTotals(data.allWinrates);

          return (
            <StatsContainer>
              <main>
                <Deck>
                  <img width='150' src={deck.heroImage} alt={deck.name} />
                  <h2>{`${deck.name}`}</h2>
                  <DeckWinrate color={getWinrateColor(totals.winrate)}>
                    <span>{totals.winrate}%</span> in {totals.games} games
                  </DeckWinrate>
                </Deck>
                <ListOfClasses>
                  {this.showStats(data.allWinrates, totals)}
                </ListOfClasses>
              </main>
            </StatsContainer>
          )
        }}
      </Query>
    )
  }
}

export default compose(
  withRouter,
  graphql(getActiveDeck, {
    props: ({ data: { activeDeck } }) => ({
        activeDeck
    })
  })
)(Stats);
