import React from 'react';

import { compose, graphql } from 'react-apollo';
import updateGameOutcome from '../graphql/updateGameOutcome';
import getCurrentGame from '../graphql/getCurrentGame';

class ChooseOutcome extends React.Component {
  handleChooseOutcome(outcome) {
    this.props.updateGameOutcome({
      variables: { outcome }
    })
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentArchetype || currentGame.outcome ) return false;

    return (
      <div>
        <button onClick={() => this.handleChooseOutcome('victory')}>Victory</button>
        <button onClick={() => this.handleChooseOutcome('defeat')}>Defeat</button>
      </div>
    )
  }
}

export default compose(
  graphql(updateGameOutcome, { name: 'updateGameOutcome' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ChooseOutcome);
