import React from 'react';
import { Query } from "react-apollo";
import gql from "graphql-tag";

const ArchetypesList = () => (
  <Query
    query={gql`
      {
        allArchetypes {
          _id,
          name
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return data.allArchetypes.map(({ _id, name }) => (
        <div key={_id}>
          <p>{`${name}`}</p>
        </div>
      ));
    }}
  </Query>
);

export default ArchetypesList;
