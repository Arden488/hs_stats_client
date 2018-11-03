import gql from 'graphql-tag';

export default gql`
  mutation updateArchetype(
    $id: String!,
    $name: String!,
    $charClass: String!,
    $key_features: String
  ) {
    updateArchetype(
      id: $id,
      name: $name,
      charClass: $charClass,
      key_features: $key_features
    ) {
      _id
    }
  }
`;
