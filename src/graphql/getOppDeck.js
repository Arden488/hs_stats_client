import gql from 'graphql-tag';

export default gql` query OppDeck($id: String!) {
  getOppDeck(id: $id) {
    name,
    code,
    charClass,
    archetypeId {
      name,
      key_features
    },
    totalGames,
    key_features
  }
}`;
