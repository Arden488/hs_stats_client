import gql from 'graphql-tag';

export default gql` {
  allArchetypes {
    _id,
    name,
    charClass,
    code,
    key_features
  }
}`;
