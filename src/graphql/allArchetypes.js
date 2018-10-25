import gql from 'graphql-tag';

export default gql` {
  allArchetypes {
    _id,
    name,
    charClass,
    code,
    key_features,
    cards {
      cost,
      count, 
      dbfId, 
      id, 
      name, 
      type
    }
  }
}`;
