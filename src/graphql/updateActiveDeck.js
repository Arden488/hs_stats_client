import gql from 'graphql-tag';

export default gql`
  mutation updateActiveDeck($id: String!, $name: String!, $heroImage: String!) {
    updateActiveDeck(id: $id, name: $name, heroImage: $heroImage) @client {
      name,
      heroImage
    }
  }
`;
