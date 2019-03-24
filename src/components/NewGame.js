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
// import allOppDecks from '../graphql/allOppDecks';

import styled from 'styled-components'
import getOppDecksByClass from '../graphql/getOppDecksByClass';

const NewGameContainer = styled.section`
  display: grid;
  grid-template-columns: ${props => props.outcome ? '0 auto' : 'auto 200px'};
  grid-column-gap: 30px
`;

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

  showAdvicesBlock() {
    const oppClass = this.props.currentGame.opponentClass;
    const oppClassCap = oppClass.charAt(0).toUpperCase() + oppClass.slice(1);
    
    return <Query fetchPolicy={'no-cache'} query={getOppDecksByClass} variables={{ charClass: oppClassCap }}>
      {({ loading, error, data, client }) => {
        if (loading) return <p>Loading opponents' decks...</p>;
        if (error) return <p>Error: {error}</p>;

        let decks = data.getOppDecksByClass;

        return <ShowAdvices decks={decks} />;
      }}
    </Query>
  }

  render() {
    if (!this.props.activeDeck.name) {
      return <div><Redirect to={`/`} /></div>;
    }

    const outcome = this.props.currentGame.outcome !== null;

    return (
      <NewGameContainer outcome={outcome}>
        <main>
          <ChooseOpponent />
          <ChooseMulligan />
          <ChooseOutcome />
          {this.props.currentGame.opponentClass && this.showAdvicesBlock()}
        </main>
        <aside>
          <NewGameSummary />
        </aside>
      </NewGameContainer>
    );
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
