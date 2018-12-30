import gql from 'graphql-tag';

export default gql` {
  allArchetypes {
    _id,
    name,
    charClass,
    key_cards,
    key_features
  }
}`;
