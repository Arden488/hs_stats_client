import React from 'react';

import { Query, compose, graphql } from 'react-apollo';
import getCurrentGame from '../graphql/getCurrentGame';

import { decodeDeck } from '../helpers/deck_codes_utils';
import { getCardTileById } from '../helpers/cards_api';
import { getCardById } from '../helpers/cards_api';

import { 
  groupBy as _groupBy, 
  map as _map, 
  findIndex as _findIndex,
  sortBy as _sortBy
} from 'lodash';

import styled from 'styled-components'
import getArchetype from '../graphql/getArchetype';
import { colors, spacers } from '../styles/vars';
import { SmallButton } from '../styles/buttons';

const CardList = styled.div`
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
`;

const CardChoice = styled.button`
  position: relative;
  display: block;
  background-repeat: no-repeat;
  background-color: transparent;
  background-image: url(${props => props.backgroundImage});
  background-size: 55% 23px;
  opacity: ${props => props.isPlayable ? '1' : '.6'};
  border: 0;  
  padding: 23px 0 0;
  margin-bottom: ${spacers.margins.x1};
  color: ${colors.text};
  text-align: left;
  width: 100%;

  :focus {
    outline: 0; 
  }
`;

const CardChoiceCost = styled.span`
  color: #ffffff;
  display: block;
  background: ${colors.third};
  width: 23px;
  line-height: 23px;
  height: 23px;
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
`;

const CardChoiceCount = styled.span`
  display: block;
  color: ${colors.primary};
  font-size: 10px;
  width: 10px;
  height: 10px;
  position: absolute;
  top: 0;
  left: -10px;
  text-align: center;
`;

const CardChoiceMechanics = styled.span`
  display: block;
  padding: 5px 0;
`;

const CardChoiceMechanicsItem = styled.span`
  display: inline-block;
  font-size: 7px;
  margin-right: 5px;
  margin-bottom: 3px;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 3px;
  padding: 2px 4px;
`;

const CardChoiceMechanicsRefItem = styled(CardChoiceMechanicsItem)`
  border-color: ${colors.third};
  color: ${colors.third};
`;

const CardChoiceRace = styled.span`
  font-size: 6px;
  position: absolute;
  left: 60%;
  top: 13px;
`;

const CardChoiceName = styled.span`
  font-size: 8px;
  position: absolute;
  left: 60%;
  top: 2px;
  max-width: 40%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
`;

const CardGroup = styled.div``;

class ShowAdvices extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playedCards: [],
      opponentMana: 0
    }

    this.increaseMana = this.increaseMana.bind(this);
  }

  outputAllCardsByArchetype(code) {
    const deckData = decodeDeck(code);
    let cards = this.fetchDeckCards(deckData.cards);

    this.state.playedCards.forEach(pc => {
      const i = _findIndex(cards, { 'id': pc.id })
      
      if (cards[i].count === 2) {
        cards[i].count = 1;
      } else {
        cards.splice(i, 1);
      }
    })

    cards = _sortBy(cards, ['cost']);

    const cardsByGroup = _groupBy(cards, 'type');

    return (
      <CardList>
        {this.outputCardGroupsList(cardsByGroup)}
      </CardList>
    )
  }

  handleChooseCard(card) {
    const newArr = this.state.playedCards;
    newArr.push(card);

    this.setState({
      playedCards: newArr
    });
  }

  processCardDescription(text) {
    const mechs = [];

    return mechs;
  }

  outputCardMechanics(card) {
    const mechanics = [];
    const refs = [];
    const mechsToExclude = ['BATTLECRY', 'TRIGGER_VISUAL', 'COLLECTIONMANAGER_FILTER_MANA_ODD']
    const tagsToExclude = [];

    if ( card.mechanics ) {
      card.mechanics.forEach(m => {
        if (mechsToExclude.indexOf(m) === -1) {
          mechanics.push(m)
        }

        // const textMechs = this.processCardDescription(card.text);
        // if (textMechs) {
        //   mechanics.push(textMechs)
        // }
      })
    }

    if ( card.referencedTags ) {
      card.referencedTags.forEach(m => {
        if (m.indexOf(tagsToExclude) !== -1) {
          refs.push(m)
        }
      })
    }

    return (
      <CardChoiceMechanics>
        {mechanics.map(m => <CardChoiceMechanicsItem key={m}>{m}</CardChoiceMechanicsItem>)}
        {refs.map(m => <CardChoiceMechanicsRefItem key={m}>{m}</CardChoiceMechanicsRefItem>)}
      </CardChoiceMechanics>
    )
  }

  outputCardList(type, cards) {
    return cards.map(card => {
      const image = getCardTileById(card.id);
      let isPlayable = false;

      if (card.cost <= this.state.opponentMana) {
        isPlayable = true;
      }

      return <CardChoice 
          key={card.id} 
          onClick={() => this.handleChooseCard(card)}
          backgroundImage={image}
          isPlayable={isPlayable}
        >
          <CardChoiceName>{card.name}</CardChoiceName>
          <CardChoiceCost>{card.cost}</CardChoiceCost>
          {card.count > 1 ? <CardChoiceCount>{card.count}</CardChoiceCount> : ''}
          <CardChoiceRace>{card.race}</CardChoiceRace>
          {this.outputCardMechanics(card)}
        </CardChoice>
    })
  }

  outputCardGroupsList(cardsByGroup) {
    return _map(cardsByGroup, (cards, type) => {
      const cardsOutput = this.outputCardList(type, cards);

      return (
        <CardGroup key={type}>
          <h3>{type}</h3>
          {cardsOutput}
        </CardGroup>
      )
    })
  }

  fetchDeckCards(cardsIds) {
    const deckCards = cardsIds.map(card => {
      const cardInfo = getCardById(card[0]);
      cardInfo.count = card[1];

      return cardInfo;
    });

    return deckCards;
  }

  outputArchetypeInfo(archetype) {
    return (
      <div>
        <h3>{archetype.name}</h3>
        <p>{archetype.key_features}</p>
      </div>
    )
  }

  increaseMana() {
    const mana = this.state.opponentMana;

    this.setState({
      opponentMana: mana + 1
    })
  }

  outputOpponentGameInfo() {
    const playedCards = this.state.playedCards.map(card => {
      return <span>{card.name}</span>
    })
    
    return (
      <div>
        <p>
          Mana: {this.state.opponentMana}
          <SmallButton onClick={this.increaseMana}>+</SmallButton>
        </p>
        <p>Cards played: {playedCards}</p>
      </div>
    )
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentArchetype || currentGame.outcome ) return false;

    return (
      <Query query={getArchetype} variables={{ id: currentGame.opponentArchetype }}>
        {({ loading, error, data, client }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error}</p>;

          const opponentGameInfo = this.outputOpponentGameInfo();
          const cards = this.outputAllCardsByArchetype(data.getArchetype.code);
          const archetypeInfo = this.outputArchetypeInfo(data.getArchetype);

          return (
            <div>
              {archetypeInfo}
              {opponentGameInfo}
              {cards}
            </div>
          )
        }}
      </Query>
    )
  }
}

export default compose(
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ShowAdvices);

