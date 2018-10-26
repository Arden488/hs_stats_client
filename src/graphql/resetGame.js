import gql from 'graphql-tag';

export default gql`
  mutation {
    resetGame @client {
      opponentClass,
      opponentDeck,
      mulligan {
        cardId,
        cardName,
      },
      outcome
    }
  }
`;
