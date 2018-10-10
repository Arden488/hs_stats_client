import React from 'react';

import { getListOfClasses } from '../helpers/hero_classes';
import { compose, graphql } from 'react-apollo';
import updateGameOpponentClass from '../graphql/updateGameOpponentClass';
import getCurrentGame from '../graphql/getCurrentGame';

class ChooseOpponent extends React.Component {
  outputListOfClasses() {
    const heroClassesArray = getListOfClasses();
    const heroClasses = heroClassesArray.map(hero => {
      return (
        <div key={hero.id}>
          <button onClick={() => this.handleChooseClass(hero.name)}><img src={hero.heroImage} alt={hero.name} /></button>
        </div>
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
        {heroClasses}
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
