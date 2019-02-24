import gql from 'graphql-tag';

export default gql`
  mutation updateArchetypeNotes(
    $id: String!,
    $notes: String!
  ) {
    updateArchetypeNotes(
      id: $id,
      notes: $notes
    ) {
      _id
    }
  }
`;
