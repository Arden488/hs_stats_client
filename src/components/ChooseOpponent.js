import React from 'react';

import { getListOfClasses } from '../helpers/hero_classes';
import { compose, graphql } from 'react-apollo';
import updateGameOpponentClass from '../graphql/updateGameOpponentClass';
import getCurrentGame from '../graphql/getCurrentGame';
import styled from 'styled-components'
import { fonts, colors } from '../styles/vars';

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
    font-size: ${fonts.size};
    display: block;
    position: absolute;
    bottom: 56px;
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
      return (
        <HeroChooseButton key={hero.id} onClick={() => this.handleChooseClass(hero.name)}>
          <img src={hero.heroImage} alt={hero.name} />
          <span>00.00%</span>
        </HeroChooseButton>
      );
    });

    return heroClasses
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
