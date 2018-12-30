import gql from 'graphql-tag';

export default gql`
  mutation createArchetype(
    $name: String!,
    $charClass: String!,
    $key_cards: [Number],
    $key_features: String
  ) {
    createArchetype(
      name: $name,
      charClass: $charClass,
      key_cards: $key_cards,
      key_features: $key_features
    ) {
      _id
    }
  }
`;
