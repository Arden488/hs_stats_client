import gql from 'graphql-tag';

export default gql`
  mutation createGameAndUpdateWinrate(
    $deckId: String!, 
    $opponentClass: String!, 
    $opponentDeck: String!, 
    $outcome: String!,
    $mulligan: [WinrateCardInput]
  ) {
    createGame(
      deckId: $deckId, 
      opponentClass: $opponentClass, 
      opponentDeck: $opponentDeck, 
      outcome: $outcome
    ) {
      _id
    }
    updateWinrate(
      deckId: $deckId,
      opponentClass: $opponentClass, 
      opponentDeck: $opponentDeck,
      outcome: $outcome,
      cards: $mulligan
    ) {
      _id,
      wins,
      losses,
      games,
      cards {
        cardId,
        wins,
        losses
      }
    }
  }
`;
