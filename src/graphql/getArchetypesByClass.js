import gql from 'graphql-tag';

export default gql` query Archetype($charClass: String!) {
  getArchetypeByClass(charClass: $charClass) {
    name,
    code,
    key_features
  }
}`;
