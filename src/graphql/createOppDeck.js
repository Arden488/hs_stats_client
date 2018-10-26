import gql from 'graphql-tag';

export default gql`
  mutation createOppDeck(
    $name: String!,
    $charClass: String!,
    $archetypeId: String!,
    $code: String!,
    $key_features: String!
  ) {
    createOppDeck(
      name: $name,
      charClass: $charClass,
      archetypeId: $archetypeId,
      code: $code,
      key_features: $key_features
    ) {
      _id
    }
  }
`;
