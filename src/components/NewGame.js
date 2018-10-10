import React from 'react';
import { withRouter, Redirect } from "react-router-dom";

import { compose, graphql } from 'react-apollo';

import ChooseOpponent from './ChooseOpponent';
import ChooseArchetype from './ChooseArchetype';
import ChooseMulligan from './ChooseMulligan';
import ChooseOutcome from './ChooseOutcome';
import NewGameSummary from './NewGameSummary';

import getCurrentGame from '../graphql/getCurrentGame';
import getActiveDeck from '../graphql/getActiveDeck';

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
    if (!this.props.activeDeck.name) {
      return <div><Redirect to={`/`} /></div>;
    }

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
  withRouter,
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  }),
  graphql(getActiveDeck, {
    props: ({ data: { activeDeck } }) => ({
        activeDeck
    })
  })
)(NewGame);
