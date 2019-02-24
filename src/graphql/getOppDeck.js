import gql from 'graphql-tag';

export default gql` query OppDeck($id: String!) {
  getOppDeck(id: $id) {
    name,
    code,
    charClass,
    archetypeId {
      _id,
      name,
      key_features
    },
    totalGames,
    key_features,
    notes
  }
}`;
