import gql from 'graphql-tag';

export default gql` query allWinrates($deckId: String!) {
  allWinrates (deckId: $deckId) {
    _id,
    opponentClass,
    opponentDeckId,
    wins,
    losses,
    games,
    cards {
      cardId,
      wins,
      losses
    }
  }
}`;
