import gql from 'graphql-tag';

export default gql`
  mutation updateDeckNotes(
    $id: String!,
    $notes: String!
  ) {
    updateDeckNotes(
      id: $id,
      notes: $notes
    ) {
      _id
    }
  }
`;
