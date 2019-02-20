import React from 'react';

import { compose, graphql } from 'react-apollo';
import getCurrentGame from '../graphql/getCurrentGame';


import { getCardImageById } from '../helpers/cards_api';

import { 
  groupBy as _groupBy, 
  map as _map, 
  filter as _filter,
  findIndex as _findIndex,
  find as _find,
  sortBy as _sortBy,
} from 'lodash';

import styled from 'styled-components'
import updateGameOpponentDeck from '../graphql/updateGameOpponentDeck';
import { colors, spacers, borders, fonts } from '../styles/vars';

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

const PreviewButton = styled.button`
  button {
    display: inline-block;
    border: 0;
    background: none;
    background-color: ${colors.blocksBg};
    width: 15px;
    height: 15px;
    border-radius: ${borders.borderRadius};
  }
`;

const CardChoice = styled.div`
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

const CardRemove = styled.button`
  background: red;
  border-radius: 50%;
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 15px;
  height: 15px;
  line-height: 15px;
  font-size: 7px;
  border: 0;
  padding: 0;
  text-align: center;
  color: ${colors.text};
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
    grid-template-columns: repeat(10, 1fr);
  }
`;

class ShowAdvices extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      decks: [],
      deckGroups: [],
      playedCards: [],
      opponentMana: 0,
      activeCards: [],
      openedDeckGroups: [],
      filteredCards: [],
      currFilter: o => {
        return o.cost <= 1
      }
    }

    // this.increaseMana = this.increaseMana.bind(this);
  }

  filterCards(filter) {
    if (filter) {
      this.setState({
        filteredCards: _filter(this.state.activeCards, filter),
        currFilter: filter
      })
    } else {
      this.setState({
        filteredCards: this.state.activeCards,
        currFilter: {}
      })
    }
  }

  outputCardsFilter() {
    return (
      <div>
        <div>
          <button onClick={() => this.filterCards({ cost: 1 })}>1</button>
          <button onClick={() => this.filterCards({ cost: 2 })}>2</button>
          <button onClick={() => this.filterCards({ cost: 3 })}>3</button>
          <button onClick={() => this.filterCards({ cost: 4 })}>4</button>
          <button onClick={() => this.filterCards({ cost: 5 })}>5</button>
          <button onClick={() => this.filterCards({ cost: 6 })}>6</button>
          <button onClick={() => this.filterCards({ cost: 7 })}>7</button>
          <button onClick={() => this.filterCards({ cost: 8 })}>8</button>
          <button onClick={() => this.filterCards({ cost: 9 })}>9</button>
          <button onClick={() => this.filterCards(o => { return o.cost >= 10 })}>10+</button>
          <button onClick={() => this.filterCards({ type: 'MINION' })}>Minion</button>
          <button onClick={() => this.filterCards({ type: 'SPELL' })}>Spell</button>
          <button onClick={() => this.filterCards({ type: 'WEAPON' })}>Weapon</button>
          <button onClick={() => this.filterCards(false)}>All</button>
        </div>
      </div>
    )
  }

  outputAllCardsByDeck(cards) {
    cards = _sortBy(cards, ['cost']);
    const cardsByGroup = _groupBy(cards, 'type');

    return (
      <div>
        {this.outputCardGroupsList(cardsByGroup)}
      </div>
    )
  }

  handleChooseCard(card) {
    const newArr = this.state.playedCards;
    let cards = this.state.activeCards;
    newArr.push(card);

    const newDecks = this.updateActualDecks(newArr)
    cards = this.updateActiveCards(newDecks, newArr)
    const filteredCards = _filter(cards, this.state.currFilter);

    const groups = _groupBy(newDecks, (v) => {
      return v.archetypeId.name
    });

    this.setState({
      playedCards: newArr,
      activeCards: cards,
      decks: newDecks,
      deckGroups: groups,
      filteredCards
    });
  }

  handleRemoveCard(card) {
    let cards = this.state.activeCards;
    
    const newDecks = this.updateActualDecks(this.state.playedCards)
    cards = this.updateActiveCards(newDecks, this.state.playedCards)

    // const removeIndex = _findIndex(cards, { 'id': card.id });
    // cards.splice(removeIndex, 1);


    const filteredCards = _filter(cards, this.state.currFilter);

    const groups = _groupBy(newDecks, (v) => {
      return v.archetypeId.name
    });

    this.setState({
      activeCards: cards,
      decks: newDecks,
      deckGroups: groups,
      filteredCards
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
      let deckSuggestion = '';

      // if ( (card.decks.length/this.state.decks.length)*100 <= 20 && this.state.decks.length > 1 ) {
      // if ( card.decks.length < deckGroups.length )
      if ( Object.keys(this.state.deckGroups).length > 1 || card.decks.length > 1 ) {
        const displaySuggestions = _groupBy(card.decks, (v) => {
          return v.archetype
        });
        deckSuggestion = Object.keys(displaySuggestions).map(sugg => <DeckSuggestion key={sugg}>{sugg}</DeckSuggestion>)
      } else if (card.decks.length/this.state.deckGroups.length*100 <= 50) {
        deckSuggestion = card.decks.map(deck => <DeckSuggestion key={deck.name}>{deck.name}</DeckSuggestion>)
      }
      // }

      return <CardChoice 
          key={card.id} 
        >
          <CardChoiceName>{card.name}</CardChoiceName>
          <CardRemove onClick={() => this.handleRemoveCard(card)}>X</CardRemove>
          {card.count > 1 ? <CardChoiceCount>{card.count}</CardChoiceCount> : ''}
          <img onClick={() => this.handleChooseCard(card)} src={image} alt={card.name} />
          {deckSuggestion}
        </CardChoice>
    })
  }

  outputCardGroupsList(cardsByGroup) {
    return _map(cardsByGroup, (cards, type) => {
      const cardsOutput = this.outputCardList(type, cards);

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
        <p>Cards played:<br />{playedCards}</p>
      </div>
    )
  }

  updateActiveCards(decks, playedCards) {
    let cards = [];

    decks.forEach(deck => {
      deck.cards.forEach(card => {
        // if ( !card.decks ) { card.decks = []; }
        const deckData = { name: deck.name, archetype: deck.archetypeId.name };
        
        const index = _findIndex(cards, { 'id': card.id });
        if ( index === -1 ) {
          card.decks = [deckData];
          cards.push(card)
        } else if ( cards[index].count < 2 && cards[index].rarity !== 'LEGENDARY' ) {
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

  componentDidMount() {
    const oppClass = this.props.currentGame.opponentClass;
    const newDecks = _filter(this.props.decks, { charClass: oppClass[0].toUpperCase() + oppClass.substring(1) });
    const newCards = this.updateActiveCards(newDecks, this.state.playedCards);
    const filteredCards = _filter(newCards, this.state.currFilter);

    const groups = _groupBy(newDecks, (v) => {
      return v.archetypeId.name
    });

    this.setState({
      decks: newDecks,
      activeCards: newCards,
      deckGroups: groups,
      filteredCards
    })
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if(this.props.currentGame.opponentClass && 
  //     this.props.currentGame.opponentClass !== prevProps.currentGame.opponentClass) {
  //     const oppClass = this.props.currentGame.opponentClass;
  //     const newDecks = _filter(this.props.decks, { charClass: oppClass[0].toUpperCase() + oppClass.substring(1) });
  //     const newCards = this.updateActiveCards(newDecks, this.state.playedCards);
  //     const filteredCards = _filter(newCards, this.state.currFilter);

  //     const groups = _groupBy(newDecks, (v) => {
  //       return v.archetypeId.name
  //     });

  //     this.setState({
  //       decks: newDecks,
  //       activeCards: newCards,
  //       deckGroups: groups,
  //       filteredCards
  //     })
  //   }

    // if(this.props.decks === prevProps.decks && this.state.decks.length === 0) {
    //   const newDecks = _filter(this.props.decks, { charClass: this.props.currentGame.opponentClass });
    //   const newCards = this.updateActiveCards(newDecks, this.state.playedCards);

    //   this.setState({
    //     decks: newDecks,
    //     activeCards: newCards
    //   })
    // }
  // }

  expandDeckGroup(key) {
    const openedDeckGroups = this.state.openedDeckGroups;
    openedDeckGroups.push(key);

    this.setState({
      openedDeckGroups
    })
  }

  outputDeck(deck) {
    let additional = '';
    
    if (deck.key_features) {
      const featArr = deck.key_features.split(/\n/)
      const games = featArr[0].split('Total games: ')[1].slice(0,-1);;
      additional = ( <p>{games}</p> )
    }
    
    return <DeckVariant 
      onClick={() => this.handleChooseOppDeck(deck._id)}
      key={deck._id}>
      {deck.name}
      {additional}
    </DeckVariant>
  }

  outputExpectedDecks() {
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
        {Object.keys(this.state.deckGroups).map((key) => {
          const group = _sortBy(this.state.deckGroups[key], o => {
            const featArr = o.key_features.split(/\n/)
            const games = featArr[0].split('Total games: ')[1].slice(0,-1);
            return parseInt(games);
          }).reverse();
          let output = this.state.openedDeckGroups.indexOf(key) === -1 ? (
            <DeckVariant
              onClick={() => this.expandDeckGroup(key)}
              key={key}>
              {key}
              <span>{group.length}</span>
              <PreviewButton></PreviewButton>}
            </DeckVariant>
          ) : group.map(deck => {
            return this.outputDeck(deck)
          });

          if (group.length <= 3) {
            output = group.map(deck => {
              return this.outputDeck(deck)
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

  updateActualDecks(playedCards/*, removedCards*/) {
    const decks = this.state.decks;
    const leftDecks = [];

    decks.forEach((dck) => {
      let av = true;
      playedCards.forEach(c => {
        const i = _findIndex(dck.cards, { 'id': c.id })
        if (i === -1) {
          av = false
        }
      })
      // removedCards.forEach(c => {
      //   const i = _findIndex(dck.cards, { 'id': c.id })
      //   if (i === -1) {
      //     av = false
      //   }
      // })

      if (av) {
        leftDecks.push(dck);
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

    const cardsFilter = this.outputCardsFilter();
    const cardsList = this.outputAllCardsByDeck(this.state.filteredCards);
    const opponentInfo = this.outputOpponentGameInfo();
    const expectedDecks = this.outputExpectedDecks();

    return (
      <div>
        {expectedDecks}
        {opponentInfo}
        {cardsFilter}
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

