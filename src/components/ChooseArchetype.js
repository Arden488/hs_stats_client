import React from 'react';

import getArchetypes from '../graphql/getArchetypes';
import { getHeroByName } from '../helpers/hero_classes';
import { Query, compose, graphql } from 'react-apollo';
import updateGameOpponentArchetype from '../graphql/updateGameOpponentArchetype';
import getCurrentGame from '../graphql/getCurrentGame';

class ChooseArchetype extends React.Component {
  outputArchetypesList(archetypes, opponentClass) {
    return archetypes.map(({ _id, name, charClass }) => {
      if (opponentClass !== charClass) {
        return false;
      }

      const heroImage = getHeroByName(charClass).heroImage;

      return (
        <div key={_id}>
          <button onClick={() => this.handleChooseArchetype(_id)}>
            <h4>{`${name}`}</h4>
            <img src={heroImage} alt={name} />
          </button>
        </div>
      )
    });
  }

  handleChooseArchetype(id) {
    this.props.updateGameOpponentArchetype({
      variables: { opponentArchetype: id }
    })
  }

  render() {
    const { currentGame } = this.props;

    if ( currentGame.mulligan.length < 3 || currentGame.opponentArchetype ) return false;

    return (
      <Query query={getArchetypes}>
        {({ loading, error, data, client }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

            return this.outputArchetypesList(data.allArchetypes, currentGame.opponentClass);
        }}
      </Query>
    )
  }
}

export default compose(
  graphql(updateGameOpponentArchetype, { name: 'updateGameOpponentArchetype' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ChooseArchetype);
