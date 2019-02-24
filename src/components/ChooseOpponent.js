import React from 'react';

import { getListOfClasses } from '../helpers/hero_classes';
import { compose, graphql, Query } from 'react-apollo';
import updateGameOpponentClass from '../graphql/updateGameOpponentClass';
import getCurrentGame from '../graphql/getCurrentGame';
import getWinratesByClass from '../graphql/getWinratesByClass';
import styled from 'styled-components'
import { fonts, colors } from '../styles/vars';
import { getData } from '../helpers/storage_utils';
import { getWinrateColor } from '../helpers/misc_utils';

const HeroClassesList = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 20%);
`;

const HeroChooseButton = styled.button`
  background: none;
  cursor: pointer;
  border: 0;
  position: relative;

  img {
    display: inline-block;
    background-image: url(images/card_placeholder.png);
    background-size: contain;
    width: 256px;
    max-width: 100%;
  }
`;

const OpponentWinrate = styled.p`
  font-size: ${fonts.smallSize};
  color: ${colors.text};
  margin: 0;
  text-align: center;

  span {
    color: ${props => props.color || colors.text};
  }
`;

class ChooseOpponent extends React.Component {
  outputListOfClasses() {
    const heroClassesArray = getListOfClasses();
    const heroClasses = heroClassesArray.map(hero => {
      const classWinrate = this.outputClassWinrate(hero.name)
      return (
        <HeroChooseButton key={hero.id} onClick={() => this.handleChooseClass(hero.name)}>
          <img src={hero.heroImage} alt={hero.name} />
          {classWinrate}
        </HeroChooseButton>
      );
    });

    return heroClasses
  }

  outputClassWinrate(opponentClass) {
    return <Query 
      query={getWinratesByClass} 
      variables={{ deckId: getData('deck').id, opponentClass }}
    >
      {({ loading, error, data }) => {
        if (loading) return <OpponentWinrate>Loading...</OpponentWinrate>;
        if (error) return <OpponentWinrate>Error...</OpponentWinrate>;

        return this.outputWinrate(data.getWinratesByClass);
      }}
    </Query>
  }

  outputWinrate(winrates) {
    let games = 0;
    let wins = 0;
    // let winrate = `Not enough data`;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
    });

    // if (games >= 10) {
    const winrate = `${((wins/games) * 100).toFixed(2)}%`;
    // }

    return (
      <OpponentWinrate color={getWinrateColor(winrate)}><span>{winrate}</span> ({games})</OpponentWinrate>
    )
  }

  handleChooseClass(name) {
    this.props.updateGameOpponentClass({
      variables: { opponentClass: name }
    })
  }

  render() {
    const { currentGame } = this.props;
    
    if ( currentGame.opponentClass ) return false;
    
    const heroClasses = this.outputListOfClasses();


    return (
      <div>
        <p>Choose your opponent's class:</p>
        <HeroClassesList>{heroClasses}</HeroClassesList>
      </div>
    )
  }
}

export default compose(
  graphql(updateGameOpponentClass, { name: 'updateGameOpponentClass' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ChooseOpponent);
