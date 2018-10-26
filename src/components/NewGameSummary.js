import React from 'react';
import { withRouter, Redirect } from "react-router-dom";
import { Mutation, Query, compose, graphql } from 'react-apollo';
import { uniqBy as _uniqBy } from 'lodash';

import getCurrentGame from '../graphql/getCurrentGame';
import getOppDeck from '../graphql/getOppDeck';
import createGameAndUpdateWinrate from '../graphql/createGameAndUpdateWinrate';
import { getData } from '../helpers/storage_utils';
import resetGame from '../graphql/resetGame';
import getWinratesByClass from '../graphql/getWinratesByClass';
import { colors, spacers } from '../styles/vars';
import { LargeButton } from '../styles/buttons';
import styled from 'styled-components'

const GameSummary = styled.section`
  position: ${props => props.isStatic ? 'static' : 'fixed'};
  background: ${colors.layoutBg};
  width: 100%;
  left: 0;
  bottom: 0;
  transform: translateY(${props => props.isStatic ? '0px': (props.isOpen ? '0px' : '100%')});
  transition: transform .5s;
  box-sizing: border-box;
`;

const GameSummaryHeader = styled.header`
  position: ${props => props.isStatic ? 'static' : 'absolute'};
  bottom: 100%;
  width: 100%;
  background: ${props => props.isStatic ? 'none' : colors.blocksBg};
  padding: ${spacers.paddings.x1} ${spacers.paddings.x2};
`;

const GameSummaryContent = styled.article`
  padding: ${spacers.paddings.x1} ${spacers.paddings.x2};
`;

class NewGameSummary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    }

    this.handleGameSummaryVisibility = this.handleGameSummaryVisibility.bind(this); 
  }

  outputWinrate(winrates) {
    let games = 0;
    let wins = 0;
    let losses = 0;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
      losses += wr.losses;
    });

    const winrate = `${((wins/games) * 100).toFixed(2)}%`;

    return (
      <span>{winrate} (W: {wins} / L: {losses} / G: {games})</span>
    )
  }

  outputOppDeck(deck) {
    if ( !deck ) {
      return <span>Empty</span>;
    }

    return (
      <Query
        query={getOppDeck}
        variables={{ id: deck }}
      >
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          this.archetype = data.getOppDeck.name;

          return (
            <span>{data.getOppDeck.name}</span>
          );
        }}
      </Query>
    )
  }

  outputSaveButton(game) {
    if ( !game.opponentClass || !game.opponentDeck || !game.outcome || game.mulligan.length < 3 ) {
      return null;
    }

    const deckId = getData('deck').id;

    return (
      <Mutation 
        mutation={createGameAndUpdateWinrate}
        refetchQueries={['getWinratesByClass']}
      >
        {(createGameAndUpdateWinrate, { loading, error, data, client }) => {
          if (data && data.createGame._id) {
            this.props.resetGame()
            return <div><Redirect to={`/`} /></div>;
          }

          const mulligan = _uniqBy(game.mulligan, 'cardId').map(card => {
            card = { cardId: card.cardId }
            return card;
          });
          
          return (
            <div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  createGameAndUpdateWinrate({ variables: { 
                    deckId,  
                    opponentClass: game.opponentClass, 
                    opponentDeck: game.opponentDeck, 
                    outcome: game.outcome,
                    mulligan: mulligan
                  } });
                }}
              >
                <LargeButton type="submit">Save game</LargeButton>
              </form>
              {loading && <p>Loading...</p>}
              {error && <p>Error :( Please try again</p>}
            </div>
          )
        }}
      </Mutation>
    )
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

  handleGameSummaryVisibility() {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const { currentGame } = this.props;
    let ClassWinrate = '';

    if (currentGame.opponentClass) {
      ClassWinrate = this.outputClassWinrate(currentGame.opponentClass);
    }

    const SaveButton = this.outputSaveButton(currentGame);
    let chosenClass = 'Choose class to see information';
    let chosenMulligan = '';
    let chosenOppDeck = '';
    let chosenOutcome = '';

    if (currentGame.opponentClass) {
      chosenClass = <p><strong>Opponent class:</strong> {currentGame.opponentClass} {ClassWinrate}</p>
    }

    if (currentGame.mulligan.length > 0) {
      const mulligan = currentGame.mulligan.map((card, i) => (
        <span key={`${card.cardId}_${i}`}>{card.cardName} / </span>
      ));
      chosenMulligan = <p><strong>Mulligan:</strong> {mulligan}</p>;
    }

    if (currentGame.opponentDeck) {
      const OppDeck = this.outputOppDeck(currentGame.opponentDeck);
      chosenOppDeck = <p><strong>Opponent archetype:</strong> {OppDeck}</p>;
    }

    if (currentGame.outcome) {
      chosenOutcome = <p><strong>Outcome:</strong> {currentGame.outcome}</p>;
    }


    return (
      <GameSummary isOpen={this.state.isOpen} isStatic={currentGame.outcome !== null}>
        <GameSummaryHeader onClick={this.handleGameSummaryVisibility} isStatic={currentGame.outcome !== null}>
          <h3>Game summary</h3>
        </GameSummaryHeader>

        <GameSummaryContent>
          {chosenClass}
          {chosenMulligan}
          {chosenOppDeck}
          {chosenOutcome}

          {SaveButton}
        </GameSummaryContent>
      </GameSummary>
    )
  }
}

export default compose(
  withRouter,
  graphql(resetGame, { name: 'resetGame' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  }),
)(NewGameSummary);
