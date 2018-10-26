import gql from 'graphql-tag';

export default gql` query OppDeck($charClass: String!) {
  getOppDecksByClass(charClass: $charClass) {
    name,
    code,
    key_features
  }
}`;
