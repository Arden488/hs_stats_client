import gql from 'graphql-tag';

export default gql` {
  allOppDecks {
    _id,
    name,
    archetypeId {
      name,
      key_features
    },
    charClass,
    code,
    key_features,
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
