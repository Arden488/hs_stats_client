import React from 'react';

import { getListOfClasses } from '../helpers/hero_classes';
import { compose, graphql, Query } from 'react-apollo';
import updateGameOpponentClass from '../graphql/updateGameOpponentClass';
import getCurrentGame from '../graphql/getCurrentGame';
import getWinratesByClass from '../graphql/getWinratesByClass';
import styled from 'styled-components'
import { fonts, colors } from '../styles/vars';
import { getData } from '../helpers/storage_utils';

const HeroClassesList = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 20%);
`;

const HeroChooseButton = styled.button`
  background: none;
  cursor: pointer;
  border: 0;
  position: relative;

  span {
    font-size: ${fonts.smallSize};
    display: block;
    position: absolute;
    bottom: 0;
    right: 0px;
    width: 100%;
    text-align: center;
    color: ${colors.text};
  }

  img {
    max-width: 100%;
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
        if (loading) return <span>Loading...</span>;
        if (error) return <span>Error: {error}</span>;

        return this.outputWinrate(data.getWinratesByClass);
      }}
    </Query>
  }

  outputWinrate(winrates) {
    let games = 0;
    let wins = 0;
    let winrate = `Not enough data`;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
    });

    if (games >= 10) {
      winrate = `${((wins/games) * 100).toFixed(2)}%`;
    }

    return (
      <span>{winrate} ({games})</span>
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
