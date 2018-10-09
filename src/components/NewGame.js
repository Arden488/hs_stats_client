import React from 'react';

import { compose, graphql } from 'react-apollo';

import ChooseOpponent from './ChooseOpponent';
import ChooseArchetype from './ChooseArchetype';
import ChooseMulligan from './ChooseMulligan';
import ChooseOutcome from './ChooseOutcome';
import NewGameSummary from './NewGameSummary';

import getCurrentGame from '../graphql/getCurrentGame';

class NewGame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opponent: {}
    }
  }

  handleChooseClass(heroClass) {
    this.setState({
      opponent: {
        heroClass
      } 
    })
  }

  render() {
    const { currentGame } = this.props;

    return (
      <div>
        <NewGameSummary />
        <ChooseOpponent />
        <ChooseMulligan />
        <ChooseArchetype />
        <ChooseOutcome />
      </div>
    )
  }
}

export default compose(
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(NewGame);
