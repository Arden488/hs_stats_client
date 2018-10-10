import gql from 'graphql-tag';

export default gql` {
  allWinrates {
    _id,
    deckId,
    opponentArchetypeId,
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
