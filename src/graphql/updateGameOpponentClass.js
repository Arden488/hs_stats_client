import gql from 'graphql-tag';

export default gql`
  mutation updateGameOpponentClass($opponentClass: String!) {
    updateGameOpponentClass(opponentClass: $opponentClass) @client {
      opponentClass
    }
  }
`;
