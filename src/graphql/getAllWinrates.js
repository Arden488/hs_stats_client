import gql from 'graphql-tag';

export default gql` {
  allWinrates {
    _id,
    deckId,
    opponentClass,
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
