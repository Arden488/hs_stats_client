import gql from 'graphql-tag';

export default gql`
  mutation createArchetype(
    $name: String!,
    $charClass: String!,
    $key_features: String
  ) {
    createArchetype(
      name: $name,
      charClass: $charClass,
      key_features: $key_features
    ) {
      _id
    }
  }
`;
