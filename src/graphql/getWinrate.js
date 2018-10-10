import gql from 'graphql-tag';

export default gql` query Winrate($deckId: String!, $opponentArchetypeId: String!) {
  getWinrate(deckId: $deckId, opponentArchetypeId: $opponentArchetypeId) {
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
