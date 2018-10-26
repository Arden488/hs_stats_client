import React from 'react';

import { Query, compose, graphql } from 'react-apollo';
import getCurrentGame from '../graphql/getCurrentGame';


import { getCardImageById } from '../helpers/cards_api';

import { 
  groupBy as _groupBy, 
  map as _map, 
  filter as _filter,
  findIndex as _findIndex,
  sortBy as _sortBy,
  uniqBy as _uniqBy
} from 'lodash';

import styled from 'styled-components'
import getOppDecksByClass from '../graphql/getOppDecksByClass';
import { colors, spacers } from '../styles/vars';
import { SmallButton } from '../styles/buttons';

const CardList = styled.div`

`;

const CardChoice = styled.button`
  position: relative;
  display: inline-block;
  background-repeat: no-repeat;
  background-color: transparent;
  background-image: url(${props => props.backgroundImage});
  background-size: 100%;
  opacity: ${props => props.isPlayable ? '1' : '.6'};
  border: 0;  
  padding: 0;
  margin-bottom: ${spacers.margins.x1};
  color: ${colors.text};
  text-align: left;
  width: 50%;
  height: 268px;

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
      decks: [],
      playedCards: [],
      opponentMana: 0,
      activeCards: []
    }

    this.increaseMana = this.increaseMana.bind(this);
  }

  outputAllCardsByDeck(cards) {
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
    let cards = this.state.activeCards;
    newArr.push(card);

    const decks = this.updateActualDecks(newArr)
    cards = this.updateActiveCards(decks, newArr)

    this.setState({
      playedCards: newArr,
      activeCards: cards,
      decks
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
      const image = getCardImageById(card.id);
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
          {/* {this.outputCardMechanics(card)} */}
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

  outputDeckInfo(deck) {
    return (
      <div>
        <h3>{deck.name}</h3>
        <p>{deck.key_features}</p>
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
    const playedCards = this.state.playedCards.map((card, i) => {
      return <span key={i}>{card.name}</span>
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

  updateActiveCards(decks, playedCards) {
    let cards = [];

    decks.forEach(arch => {
      cards = arch.cards.concat(cards)
    })

    cards = _uniqBy(cards, 'id');

    playedCards.forEach(card => {
      const i = _findIndex(cards, { 'id': card.id })
      
      if (cards[i]) {
        if (cards[i].count === 2) {
          cards[i].count = 1;
        } else {
          cards.splice(i, 1);
        }
      }
    })

    return cards;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.decks === prevProps.decks && this.state.decks.length === 0) {
      const newDecks = _filter(this.props.decks, { charClass: this.props.currentGame.opponentClass });
      const newCards = this.updateActiveCards(newDecks, this.state.playedCards);

      this.setState({
        archetypes: newDecks,
        activeCards: newCards
      })
    }
  }

  outputExpectedArchetypes(decks) {
    let dcks = [];
    const matches = {};
    dcks = decks;

    decks.forEach((el, i) => {
      const v = el.name.search(/v[0-9]+/g);
      let x = el;
      if (v !== -1) {
        x.name = x.name.slice(0, v-1);
      }

      const index = _findIndex(dcks, { name: x.name });

      if (index === -1) {
        dcks.push(x)
      } else {
        if (!matches[index]) { matches[index] = 1 }
        matches[index] = matches[index] + 1;
      }
    });

    return (
      <div>
        <h4>Expected decks:</h4>
        {dcks.map((a, i) => {
          return (
            <p key={i}><strong>{a.name}</strong> {matches[i] && <span>({matches[i]} sim.)</span>}<br />{a.key_features}</p>
          )
        })}
      </div>
    )
  }

  updateActualDecks(cards) {
    const decks = this.state.decks;
    const leftDecks = [];

    decks.forEach((dck, index) => {
      if (cards.length > 0) {
        let av = true;
        cards.forEach(c => {
          const i = _findIndex(dck.cards, { 'id': c.id })
          if (i === -1) {
            av = false
          }
        })
        if (av) {
          leftDecks.push(dck);
        }
      }
    })

    if (decks.length === 0) {
      alert('NO ACTIVE DECKS')
    }

    return leftDecks
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentClass || currentGame.mulligan.length < 3 || currentGame.outcome ) return false;

    const cardsList = this.outputAllCardsByDeck(this.state.activeCards);
    const opponentInfo = this.outputOpponentGameInfo();
    const expectedDecks = this.outputExpectedDecks(this.state.decks);

    return (
      <div>
        {expectedDecks}
        {opponentInfo}
        {cardsList}
      </div>
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

