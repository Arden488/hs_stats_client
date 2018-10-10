import gql from 'graphql-tag';

export default gql` query Archetype($id: String!) {
  getArchetype(id: $id) {
    name
  }
}`;
