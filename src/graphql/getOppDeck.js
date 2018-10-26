import gql from 'graphql-tag';

export default gql` query OppDeck($id: String!) {
  getOppDeck(id: $id) {
    name,
    code,
    archetypeId {
      name,
      key_features
    },
    key_features
  }
}`;
