import gql from 'graphql-tag';

export default gql` query getOppDecksByClass($charClass: String!) {
  getOppDecksByClass(charClass: $charClass) {
    _id,
    name,
    archetypeId {
      _id,
      name,
      key_features,
      notes
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
