import gql from 'graphql-tag';

export default gql` {
  currentGame @client {
    opponentClass,
    opponentArchetype,
    mulligan {
      cardId,
      cardName,
    },
    outcome
  }
}`;

