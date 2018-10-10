import gql from 'graphql-tag';

export default gql`
  mutation updateGameOpponentArchetype($opponentArchetype: String!) {
    updateGameOpponentArchetype(opponentArchetype: $opponentArchetype) @client {
      opponentArchetype
    }
  }
`;
