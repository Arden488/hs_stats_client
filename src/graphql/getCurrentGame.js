import gql from 'graphql-tag';

export default gql` {
  currentGame @client {
    opponentClass,
    opponentDeck,
    mulligan {
      cardId,
      cardName,
    },
    outcome
  }
}`;

