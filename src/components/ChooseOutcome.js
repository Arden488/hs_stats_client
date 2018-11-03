import React from 'react';

import { compose, graphql } from 'react-apollo';
import updateGameOutcome from '../graphql/updateGameOutcome';
import getCurrentGame from '../graphql/getCurrentGame';

import styled from 'styled-components'
import { Button } from '../styles/buttons';
import { spacers } from '../styles/vars';

const ButtonList = styled.div`
  button {
    margin-right: ${spacers.margins.x1}
  }
`;

class ChooseOutcome extends React.Component {
  handleChooseOutcome(outcome) {
    this.props.updateGameOutcome({
      variables: { outcome }
    })
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentDeck || currentGame.outcome ) return false;

    return (
      <ButtonList>
        <h3>Choose outcome:</h3>
        <Button onClick={() => this.handleChooseOutcome('victory')}>Victory</Button>
        <Button onClick={() => this.handleChooseOutcome('defeat')}>Defeat</Button>
      </ButtonList>
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
