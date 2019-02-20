import gql from 'graphql-tag';

export default gql`
  mutation updateCurrentSession($wins: Number!, $losses: Number!) {
    updateCurrentSession(wins: $wins, losses: $losses) @client {
      wins,
      losses
    }
  }
`;
