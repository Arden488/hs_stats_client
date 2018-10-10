import gql from 'graphql-tag';

export default gql`
  mutation updateGameMulligan($mulligan: [Card]!) {
    updateGameMulligan(mulligan: $mulligan ) @client {
      mulligan
    }
  }
`;
