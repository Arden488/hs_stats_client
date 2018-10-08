import React from 'react';
import { Query, graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { decodeDeck } from '../helpers/deck_codes_utils';
import { getCardById } from '../helpers/cards_api';
import { setData } from '../helpers/storage_utils';
import updateActiveDeck from '../graphql/updateActiveDeck';

const GET_DECKS = gql` {
  allDecks {
    _id,
    name,
    code
  }
}`;

class Decks extends React.Component {
  setActiveDeck(id) {
    const deck = decodeDeck(id);
    const deckCards = deck.cards.map(card => {
      return getCardById(card[0]);
    });

    setData('deck', deck);
    setData('deckCards', deckCards);
  }
  
  handleDeckClick(deck) {
    this.setActiveDeck(deck.code);

    this.props.updateActiveDeck({
      variables: { id: deck.id, name: deck.name }
    })
  }

  outputDecksList(decks) {
    return decks.map(({ _id, name, code }) => (
      <div key={_id}>
        <button onClick={() => this.handleDeckClick({ id: _id, name, code })}>
          {`${name}`}
        </button>
      </div>
    ));
  }

  render() {
    return (
      <Query query={GET_DECKS}>
        {({ loading, error, data, client }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

            return this.outputDecksList(data.allDecks, client);
        }}
      </Query>
    );
  }
}

export default compose(
  graphql(updateActiveDeck, { name: 'updateActiveDeck' })
)(Decks);
