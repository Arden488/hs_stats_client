import React from 'react';
import { Query, graphql, compose } from 'react-apollo';
import { decodeDeck } from '../helpers/deck_codes_utils';
import { getCardById } from '../helpers/cards_api';
import { setData } from '../helpers/storage_utils';
import updateActiveDeck from '../graphql/updateActiveDeck';
import getDecks from '../graphql/getDecks';

import styled from 'styled-components'
import { LargeButton } from '../styles/buttons';

const DeckList = styled.div`
  text-align: center;
`;

class Decks extends React.Component {
  setActiveDeck(deck) {
    setData('deck', deck);
  }

  fetchDeckCards(cardsIds) {
    const deckCards = cardsIds.map(card => {
      const cardInfo = getCardById(card[0]);
      cardInfo.count = card[1];

      return cardInfo;
    });

    return deckCards;
  }

  fetchDeckHeroImage(heroId) {
    const heroCard = getCardById(heroId[0]);
    
    return `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${heroCard.id}.png`;
  }
  
  handleDeckClick(deck) {
    const deckData = decodeDeck(deck.code);
    deck.cards = this.fetchDeckCards(deckData.cards);
    deck.heroImage = this.fetchDeckHeroImage(deckData.heroes);
    
    this.setActiveDeck(deck);

    this.props.updateActiveDeck({
      variables: { id: deck.id, name: deck.name, heroImage: deck.heroImage }
    })
  }

  outputDecksList(decks) {
    return decks.map(({ _id, name, code }) => (
      <div key={_id}>
        <LargeButton onClick={() => this.handleDeckClick({ id: _id, name, code })}>
          {`${name}`}
        </LargeButton>
      </div>
    ));
  }

  render() {
    return (
      <DeckList>
        <h2>Choose your deck:</h2>
        <Query query={getDecks}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading list of decks...</p>;
            if (error) return <p>Error: {error}</p>;

              return this.outputDecksList(data.allDecks);
          }}
        </Query>
      </DeckList>
    );
  }
}

export default compose(
  graphql(updateActiveDeck, { name: 'updateActiveDeck' })
)(Decks);
