import React from 'react';
import { Query, graphql, compose } from 'react-apollo';
import { decodeDeck } from '../helpers/deck_codes_utils';
import HearthstoneJSON from "hearthstonejson-client";
import { getCardById } from '../helpers/cards_api';
import { setData } from '../helpers/storage_utils';

import updateActiveDeck from '../graphql/updateActiveDeck';
import getDecks from '../graphql/getDecks';
import getAllWinrates from '../graphql/getAllWinrates';
import allOppDecks from '../graphql/allOppDecks';

import { colors } from '../styles/vars';
import { Button } from '../styles/buttons';

import styled from 'styled-components'

const DeckList = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
`;

const Deck = styled.button`
  border: 0;
  background: none;
  cursor: pointer;
  text-align: center;
  color: ${colors.text}

  p {
    margin: 0;
    padding: 0;
  }
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

  outputDeck(deck, winrates) {
    const deckData = decodeDeck(deck.code);
    deck.heroImage = this.fetchDeckHeroImage(deckData.heroes);

    let games = 0;
    let wins = 0;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
    });

    const winrate = `${(((wins)/(games)) * 100).toFixed(2)}%`;

    return <Deck
      key={deck._id}
      onClick={() => this.handleDeckClick({ id: deck._id, name: deck.name, code: deck.code })}>
      <img width='150' src={deck.heroImage} alt={deck.name} />
      <h2>{`${deck.name}`}</h2>
      <h3>{winrate} in {games} games</h3>
    </Deck>
  }

  outputDecksList(decks) {
    return decks.map(deck => (
      <Query key={deck._id} query={getAllWinrates} variables={{ deckId: deck._id }}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

          return this.outputDeck(deck, data.allWinrates);
        }}
      </Query>
    ));
  }

  fetchNewCardsData() {
    const hsjson = new HearthstoneJSON();  
    hsjson.get('latest');
  }

  updateLocalStorage() {
    localStorage.clear();

    if (localStorage.key(0) === null) {
      alert('Cache cleared. Fetching new data...');

      this.fetchNewCardsData();
    }
  }

  checkForLocalStorage(targetName) {
    for (var i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      if (name.indexOf(targetName) !== -1) return localStorage.getItem(name)
    }

    return false;
  }

  renderDecksList() {
    return <div>
      <h2>Choose your deck:</h2>
      <Query query={getDecks}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading list of decks...</p>;
          if (error) return <p>Error: {error}</p>;

            return (
              <DeckList>{this.outputDecksList(data.allDecks)}</DeckList>
            )
        }}
      </Query>

      <br /><br />

      <Button onClick={() => this.updateLocalStorage()}>Update cards cache</Button>
    </div>
  }

  render() {
    if (!this.checkForLocalStorage('hsjson-')) this.fetchNewCardsData();

    return this.renderDecksList();
  }
}

export default compose(
  graphql(updateActiveDeck, { name: 'updateActiveDeck' })
)(Decks);
