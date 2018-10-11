import gql from 'graphql-tag';

export default gql` query getWinratesByClass($deckId: String!, $opponentClass: String!) {
  getWinratesByClass(deckId: $deckId, opponentClass: $opponentClass) {
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
