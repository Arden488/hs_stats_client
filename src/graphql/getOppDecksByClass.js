import gql from 'graphql-tag';

export default gql` query getOppDecksByClass($charClass: String!) {
  getOppDecksByClass(charClass: $charClass) {
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
