import gql from 'graphql-tag';

export default gql` {
  allOppDecks {
    _id,
    name,
    archetypeId {
      _id,
      name,
      key_features
    },
    charClass,
    code,
    key_features,
    notes,
    totalGames,
    cards {
      cost,
      count, 
      dbfId, 
      id, 
      name, 
      rarity,
      type
    }
  }
}`;
