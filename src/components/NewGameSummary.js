import React from 'react';
import { withRouter, Redirect } from "react-router-dom";
import { Mutation, Query, compose, graphql } from 'react-apollo';
import { uniqBy as _uniqBy } from 'lodash';

import getCurrentGame from '../graphql/getCurrentGame';
import getArchetype from '../graphql/getArchetype';
import createGameAndUpdateWinrate from '../graphql/createGameAndUpdateWinrate';
import { getData } from '../helpers/storage_utils';
import resetGame from '../graphql/resetGame';

class NewGameSummary extends React.Component {
  outputArchetype(archetype) {
    if ( !archetype ) {
      return <span>Empty</span>;
    }

    return (
      <Query
        query={getArchetype}
        variables={{ id: archetype }}
      >
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          this.archetype = data.getArchetype.name;

          return (
            <span>{data.getArchetype.name}</span>
          );
        }}
      </Query>
    )
  }

  outputSaveButton(game) {
    if ( !game.opponentClass || !game.opponentArchetype || !game.outcome || game.mulligan.length < 3 ) {
      return null;
    }

    const deckId = getData('deck').id;

    return (
      <Mutation mutation={createGameAndUpdateWinrate}>
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
                    opponentArchetype: game.opponentArchetype, 
                    outcome: game.outcome,
                    mulligan: mulligan
                  } });
                }}
              >
                <button type="submit">Save game</button>
              </form>
              {loading && <p>Loading...</p>}
              {error && <p>Error :( Please try again</p>}
            </div>
          )
        }}
      </Mutation>
    )
  }

  render() {
    const { currentGame } = this.props;
    const mulligan = currentGame.mulligan.map((card, i) => (
      <span key={`${card.cardId}_${i}`}>{card.cardName} / </span>
    ));

    const Archetype = this.outputArchetype(currentGame.opponentArchetype);

    const SaveButton = this.outputSaveButton(currentGame);

    return (
      <div>
        <p><strong>Opponent class:</strong> {currentGame.opponentClass}</p>
        <p><strong>Mulligan:</strong> {mulligan}</p>
        <p><strong>Opponent archetype:</strong> {Archetype}</p>
        <p><strong>Outcome:</strong> {currentGame.outcome}</p>

        {SaveButton}
      </div>
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