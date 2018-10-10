import gql from 'graphql-tag';

export default gql`
  mutation createGameAndUpdateWinrate(
    $deckId: String!, 
    $opponentClass: String!, 
    $opponentArchetype: String!, 
    $outcome: String!,
    $mulligan: [WinrateCardInput]
  ) {
    createGame(
      deckId: $deckId, 
      opponentClass: $opponentClass, 
      opponentArchetype: $opponentArchetype, 
      outcome: $outcome
    ) {
      _id
    }
    updateWinrate(
      deckId: $deckId,
      opponentArchetype: $opponentArchetype,
      outcome: $outcome,
      cards: $mulligan
    ) {
      _id
    }
  }
`;
