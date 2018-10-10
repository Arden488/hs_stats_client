import gql from 'graphql-tag';

export default gql` {
  allDecks {
    _id,
    name,
    code
  }
}`;
