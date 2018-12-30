import gql from 'graphql-tag';

export default gql` {
  activeDeck @client {
    id,
    name,
    heroImage
  }
}`;

