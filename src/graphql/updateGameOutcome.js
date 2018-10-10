import gql from 'graphql-tag';

export default gql`
  mutation updateGameOutcome($outcome: String!) {
    updateGameOutcome(outcome: $outcome) @client {
      outcome
    }
  }
`;
