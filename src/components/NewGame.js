import React from 'react';
import { withRouter, Redirect } from "react-router-dom";

import { Query, compose, graphql } from 'react-apollo';

import ChooseOpponent from './ChooseOpponent';
import ChooseMulligan from './ChooseMulligan';
import ChooseOutcome from './ChooseOutcome';
import NewGameSummary from './NewGameSummary';
import ShowAdvices from './ShowAdvices';

import getCurrentGame from '../graphql/getCurrentGame';
import getActiveDeck from '../graphql/getActiveDeck';
import allArchetypes from '../graphql/allArchetypes';

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

    

    return <Query query={allArchetypes}>
      {({ loading, error, data, client }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error: {error}</p>;

        return (
          <div>
            <NewGameSummary />
            <ChooseOpponent />
            <ChooseMulligan />
            <ShowAdvices archetypes={data.allArchetypes} />
            <ChooseOutcome />
          </div>
        );
      }}
    </Query>;
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
