import gql from 'graphql-tag';

export default gql` {
  allWinrates {
    _id,
    deckId,
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
