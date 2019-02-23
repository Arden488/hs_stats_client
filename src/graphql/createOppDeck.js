import gql from 'graphql-tag';

export default gql`
  mutation createOppDeck(
    $name: String!,
    $charClass: String!,
    $archetypeId: String!,
    $code: String!,
    $totalGames: Number!,
    $key_features: String
  ) {
    createOppDeck(
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
