import gql from 'graphql-tag';

export default gql` {
  activeDeck @client {
    name
  }
}`;

