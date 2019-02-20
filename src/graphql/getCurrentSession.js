import gql from 'graphql-tag';

export default gql` {
  currentSession @client {
    wins,
    losses
  }
}`;

