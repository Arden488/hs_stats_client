import gql from 'graphql-tag';

export default gql`
  mutation updateActiveDeck($id: String!, $name: String!) {
    updateActiveDeck(id: $id, name: $name) @client {
      name
    }
  }
`;
