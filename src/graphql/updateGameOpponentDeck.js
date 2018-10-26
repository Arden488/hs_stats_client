import gql from 'graphql-tag';

export default gql`
  mutation updateGameOpponentDeck($opponentDeck: String!) {
    updateGameOpponentDeck(opponentDeck: $opponentDeck) @client {
      opponentDeck
    }
  }
`;
