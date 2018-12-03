import React from 'react';

import { Query, compose, graphql } from 'react-apollo';
import getCurrentGame from '../graphql/getCurrentGame';


import { getCardImageById } from '../helpers/cards_api';

import { 
  groupBy as _groupBy, 
  map as _map, 
  filter as _filter,
  findIndex as _findIndex,
  find as _find,
  sortBy as _sortBy,
  uniqBy as _uniqBy
} from 'lodash';

import styled from 'styled-components'
import updateGameOpponentDeck from '../graphql/updateGameOpponentDeck';
import { colors, spacers, borders, fonts } from '../styles/vars';
import { SmallButton } from '../styles/buttons';

const CardList = styled.div``;

const PlayedCard = styled.img`
  height: 80px;
`;

const DeckSuggestion = styled.span`
  display: inline-block;
  background: ${colors.primary};
  font-size: 10px;
  padding: 3px 5px;
  border-radius: 5px;
  margin: 0 1px 1px;
  box-sizing: border-box;
  vertical-align: top;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const DeckVariant = styled.div`
  display: inline-block;
  position: relative;
  vertical-align: top;
  cursor: pointer;
  background-color: ${colors.elementsBg};
  padding: ${spacers.paddings.x1};
  padding-right: ${spacers.baseSpacer * 4}px;
  margin-right: ${spacers.margins.x1};
  margin-bottom: ${spacers.margins.x1};
  border-radius: ${borders.borderRadius};

  span {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    padding: ${spacers.paddings.x1};
    border-radius: ${borders.borderRadius};
    background: ${colors.primary};
  }

  p {
    margin: 10px 0 0;
    font-size: ${fonts.extraSmallSize}
  }
`;

const CardChoice = styled.button`
  position: relative;
  display: inline-block;
  background: none;
  border: 0;  
  padding: 0;
  margin-bottom: ${spacers.margins.x1};
  margin-right: ${spacers.margins.x2};
  color: ${colors.text};
  text-align: center;

  img {
    max-width: 100%;
  }

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
  background: ${colors.third};
  font-size: ${fonts.smallSize};
  width: 25px;
  height: 25px;
  line-height: 25px;
  font-weight: bold;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  right: 10px;
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
  left: 20px;
  top: 2px;
  max-width: 53%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
`;

const CardGroup = styled.section`
  article {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
`;

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

  outputAllCardsByDeck(cards, deckGroups) {
    cards = _sortBy(cards, ['cost']);
    const cardsByGroup = _groupBy(cards, 'type');

    return (
      <CardList>
        {this.outputCardGroupsList(cardsByGroup, deckGroups)}
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

  outputCardList(type, cards, deckGroups) {
    return cards.map(card => {
      const image = getCardImageById(card.id);
      let deckSuggestion = '';

      // if ( (card.decks.length/this.state.decks.length)*100 <= 20 && this.state.decks.length > 1 ) {
      // if ( card.decks.length < deckGroups.length )
      if ( Object.keys(deckGroups).length > 1 ) {
        const displaySuggestions = _groupBy(card.decks, (v) => {
          return v.archetype
        });
        deckSuggestion = Object.keys(displaySuggestions).map(sugg => <DeckSuggestion>{sugg}</DeckSuggestion>)
      } else if (card.decks.length/deckGroups.length*100 <= 50) {
        deckSuggestion = card.decks.map(deck => <DeckSuggestion>{deck.name}</DeckSuggestion>)
      }
      // }

      return <CardChoice 
          key={card.id} 
          onClick={() => this.handleChooseCard(card)}
        >
          <CardChoiceName>{card.name}</CardChoiceName>
          {card.count > 1 ? <CardChoiceCount>{card.count}</CardChoiceCount> : ''}
          <img src={image} alt={card.name} />
          {deckSuggestion}
        </CardChoice>
    })
  }

  outputCardGroupsList(cardsByGroup, deckGroups) {
    return _map(cardsByGroup, (cards, type) => {
      const cardsOutput = this.outputCardList(type, cards, deckGroups);

      return (
        <CardGroup key={type}>
          <h3>{type}</h3>
          <article>
            {cardsOutput}
          </article>
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
      const image = getCardImageById(card.id);
      return <PlayedCard src={image} key={i} alt={card.name} title={card.name} />
    })
    
    return (
      <div>
        {/* <p>
          Mana: {this.state.opponentMana}
          <SmallButton onClick={this.increaseMana}>+</SmallButton>
        </p> */}
        <p>Cards played:<br />{playedCards}</p>
      </div>
    )
  }

  updateActiveCards(decks, playedCards) {
    let cards = [];

    decks.forEach(deck => {
      // console.log(deck)
      deck.cards.forEach(card => {
        // if ( !card.decks ) { card.decks = []; }
        const deckData = { name: deck.name, archetype: deck.archetypeId.name };

        // console.log(deckData)
        
        const index = _findIndex(cards, { 'id': card.id });
        if ( index === -1 ) {
          card.decks = [deckData];
          cards.push(card)
        } else if ( cards[index].count < 2 ) {
          cards[index].decks.push(deckData)
          cards[index].count++;
        } else {
          cards[index].decks.push(deckData)
        }
      })
      // cards = arch.cards.concat(cards)
    })

    // cards = _uniqBy(cards, 'id');

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
        decks: newDecks,
        activeCards: newCards
      })
    }
  }

  outputExpectedDecks(groups) {
    if (this.props.currentGame.opponentDeck) {
      return (
        <div>
          <h4>Selected deck:</h4>
          <h5>{this.state.decks[0].name}</h5>
          <p>{this.state.decks[0].key_features}</p>
        </div>
      )
    }

    return (
      <div>
        <h4>Expected decks:</h4>
        {Object.keys(groups).map((key) => {
          const group = groups[key];
          let output = (
            <DeckVariant key={key}>
              {key}
              <span>{group.length}</span>
              {group[0].archetypeId.key_features && <p>{group[0].archetypeId.key_features}</p>}
            </DeckVariant>
          );

          if (group.length <= 3) {
            output = group.map(deck => {
              return (
                <DeckVariant 
                  onClick={() => this.handleChooseOppDeck(deck._id)}
                  key={deck._id}>
                  {deck.name}
                  {deck.key_features && <p>{deck.key_features}</p>}
                </DeckVariant>
              )
            })
          }

          return output;
        })}
      </div>
    )
  }

  handleChooseOppDeck(id) {
    const deck = _find(this.state.decks, { '_id': id })
    const cards = this.updateActiveCards([deck], this.state.playedCards)

    this.setState({
      decks: [deck],
      activeCards: cards
    });
    
    this.props.updateGameOpponentDeck({
      variables: { opponentDeck: id }
    })
  }

  updateActualDecks(cards) {
    const decks = this.state.decks;
    const leftDecks = [];

    decks.forEach((dck) => {
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

    const groups = _groupBy(this.state.decks, (v) => {
      return v.archetypeId.name
    });

    const cardsList = this.outputAllCardsByDeck(this.state.activeCards, groups);
    const opponentInfo = this.outputOpponentGameInfo();
    const expectedDecks = this.outputExpectedDecks(groups);

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
  graphql(updateGameOpponentDeck, { name: 'updateGameOpponentDeck' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ShowAdvices);

