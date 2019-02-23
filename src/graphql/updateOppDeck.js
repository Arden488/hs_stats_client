import gql from 'graphql-tag';

export default gql`
  mutation updateOppDeck(
    $id: String!,
    $name: String!,
    $charClass: String!,
    $archetypeId: String!,
    $code: String!,
    $totalGames: totalGames,
    $key_features: String
  ) {
    updateOppDeck(
      id: $id,
      name: $name,
      charClass: $charClass,
      archetypeId: $archetypeId,
      code: $code,
      totalGames: $totalGames,
      key_features: $key_features
    ) {
      _id
    }
  }
`;
