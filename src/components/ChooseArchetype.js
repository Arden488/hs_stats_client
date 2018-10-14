import React from 'react';

import getArchetypes from '../graphql/getArchetypes';
import { 
  concat as _concat, 
  sortBy as _sortBy,
  uniqBy as _uniqBy,
  findIndex as _findIndex,
  filter as _filter
} from 'lodash';
import { decodeDeck } from '../helpers/deck_codes_utils';
import { getCardImageById } from '../helpers/cards_api';
import { getCardById } from '../helpers/cards_api';
import { Query, compose, graphql } from 'react-apollo';
import updateGameOpponentArchetype from '../graphql/updateGameOpponentArchetype';
import getCurrentGame from '../graphql/getCurrentGame';

import styled from 'styled-components'
import { spacers, colors } from '../styles/vars';

const ArchetypeList = styled.div`
  display: grid;
  margin-bottom: ${spacers.baseSpacer * 4}px
`;

const ArchetypeItem = styled.button`
  background: none;
  border: 0;
  color: ${colors.text}
  text-align: left;
  padding-bottom: ${spacers.paddings.x2};
  margin-bottom: ${spacers.margins.x1};
  border-bottom: 1px solid ${colors.blocksBg};

  :last-child {
    border-bottom: 0;
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

const PlayedCardList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;

const PlayedCardChoice = styled.button`
  background: none;
  border: 0;  
  color: ${colors.text};
  text-align: center;

  span {
    span {
      display: block;
      color: ${colors.textFade}
    }
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

class ChooseArchetype extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeArchsIds: []
    }
  }

  outputArchetypesList(archetypes) {
    return archetypes.map(({ _id, name, charClass, key_features }) => {
      return (
        <ArchetypeItem onClick={() => this.handleChooseArchetype(_id)} key={_id}>
          <h4>{`${name}`}</h4>
          <p>{key_features}</p>
        </ArchetypeItem>
      )
    });
  }

  handleChooseArchetype(id) {
    this.props.updateGameOpponentArchetype({
      variables: { opponentArchetype: id }
    })
  }

  handleChoosePlayedCard(card, filteredArchetypes) {
    const activeTypes = _filter(filteredArchetypes, o => {
      return _findIndex(o.cards, { 'id': card.id }) === -1 ? false : true
    });

    this.setActiveArchetypes(activeTypes);
  }

  setActiveArchetypes(archs) {
    this.setState({
      activeArchsIds: archs.map(a => a._id)
    });
  }

  outputCardList(cards, filteredArchetypes) {
    return cards.map(card => {
      const image = getCardImageById(card.id);
      return (
        <PlayedCardChoice key={card.id} onClick={() => this.handleChoosePlayedCard(card, filteredArchetypes)}>
          <img width="100" src={image} alt={card.name} />
        </PlayedCardChoice>
      )
    })
  }

  outputAllPlayableCardsByArchetypes(cards, filteredArchetypes) {
    return (
      <PlayedCardList>
        {this.outputCardList(cards, filteredArchetypes)}
      </PlayedCardList>
    )
  }

  getArchetypesCards(archetypes) {
    let cards = [];

    // archetypes.forEach(arch => {
    //   cards = _sortBy(_uniqBy(_concat(cards, arch.cards), 'dbfId'), ['cost']);
    // });

    // const archetypesArraysOfCards = [];

    // console.log(archetypes);

    archetypes.forEach(deck => {
      const deckData = decodeDeck(deck.code);
      deck.cards = this.fetchDeckCards(deckData.cards, deck);

      // archetypesArraysOfCards.push(deck.cards);
      cards = _concat(cards, deck.cards)
    });

    return _sortBy(_uniqBy(cards, 'dbfId'), ['cost']);
  }

  fetchDeckCards(cardsIds, deck) {
    const deckCards = cardsIds.map(card => {
      const cardInfo = getCardById(card[0]);
      cardInfo.count = card[1];
      // cardInfo.archetypeId = deck._id;
      // cardInfo.archetypeName = deck.name;

      return cardInfo;
    });

    return deckCards;
  }

  filterArchetypesByClass(archetypes, opponentClass) {
    return archetypes.filter(item => {
      if (opponentClass === item.charClass) {
        return item;
      }

      return false;
    });
  }

  filterArchetypesByIds(archetypes, archtypesIds) {
    return archetypes.filter(item => {
      if (archtypesIds.indexOf(item._id) !== -1) {
        return item;
      }

      return false;
    });
  }

  // sortCardsByArchetype(cards) {
  //   const archs = {};

  //   cards.forEach(item => {
  //     if ( !archs[item.archetypeId] ) {
  //       archs[item.archetypeId] = { name: item.archetypeName, cards: [] }
  //     }

  //     archs[item.archetypeId].cards.push(item);
  //   })

  //   return cards;
  // } 

  render() {
    const { currentGame } = this.props;
    console.log('render')

    if ( currentGame.mulligan.length < 3 || currentGame.opponentArchetype ) return false;

    return (
      <Query query={getArchetypes}>
        {({ loading, error, data, client }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

          let cards = '';
          const filteredArchetypes = this.state.activeArchsIds.length > 0 ?
            this.filterArchetypesByIds(data.allArchetypes, this.state.activeArchsIds) : 
            this.filterArchetypesByClass(data.allArchetypes, currentGame.opponentClass);

          // if (filteredArchetypes.length > 1) {
            const allCards = this.getArchetypesCards(filteredArchetypes);
            // const cardsByArchetype = this.sortCardsByArchetype(allCards)
            cards = this.outputAllPlayableCardsByArchetypes(allCards, filteredArchetypes);
          // }

            return (
              <div>
                <h3>Choose opponent archetype:</h3>
                {cards}
                <ArchetypeList>
                  {this.outputArchetypesList(filteredArchetypes)}
                </ArchetypeList>
              </div>
            )
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
