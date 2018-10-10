import gql from 'graphql-tag';

export default gql`
  mutation {
    resetGame @client {
      opponentClass,
      opponentArchetype,
      mulligan {
        cardId,
        cardName,
      },
      outcome
    }
  }
`;
