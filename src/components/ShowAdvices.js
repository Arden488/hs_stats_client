import React from 'react';

import { Mutation, compose, graphql } from 'react-apollo';
import getCurrentGame from '../graphql/getCurrentGame';
import updateArchetypeNotes from '../graphql/updateArchetypeNotes';
import updateDeckNotes from '../graphql/updateDeckNotes';
import ChooseOutcome from './ChooseOutcome';

import { getCardImageById } from '../helpers/cards_api';

import { 
  keys as _keys,
  fromPairs as _fromPairs,
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
import { Button, SmallButton } from '../styles/buttons';

const PlayedCard = styled.img`
  height: 80px;
`;

const CardImageDuplicate = styled.img`
  position: absolute;
  top: -4%;
  left: 7%;
  opacity: .5;
  z-index: -1;
  filter: contrast(50%) grayscale(100%);
`;

const CardPopularity = styled.span`
  display: inline-block;
  background: ${(props) => props.attention === true ? colors.third : colors.elementsBg};
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
  position: relative;
  vertical-align: top;
  background-color: ${colors.elementsBg};
  padding: 4px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: ${borders.borderRadius};
  display: flex;
  justify-content: space-between;

  span {
    display: block;
    margin-bottom: 5px;
  }
`;

const DeckVariantChooseButton = styled.button`
  display: inline;
  background: ${colors.secondary};
  border-radius: ${borders.borderRadius};
  color: ${colors.text};
  border: none;
  margin: 0;
  font-size: ${fonts.extraSmallSize}
`;

const DeckGroupCount = styled.span`
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  font-size: ${fonts.extraSmallSize};
  font-family: Verdana;
  color: ${colors.text};
  text-align: center;
  padding: 5px;
  border-radius: ${borders.borderRadius};
`;

const DeckVariantList = styled.div`
  display: grid;
  grid-template-columns: repeat(4,1fr);
`;

const DeckGroup = styled(DeckVariant)`
  background-color: ${colors.blocksBg};
  display: block;
  padding: ${spacers.paddings.x1};
  margin-right: ${spacers.margins.x1};
  margin-bottom: ${spacers.margins.x1};

  grid-column-start: ${(props) => props.open === true ? '1' : 'auto'};
  grid-column: ${(props) => props.open === true ? '1/5' : 'auto'};

  > div {
    display: ${(props) => props.open === true ? 'grid' : 'block'};
    grid-template-columns: ${(props) => props.open === true ? 'repeat(auto-fill,105px)' : 'auto'};
  }
`;

const ControlButton = styled.button`
  display: inline-block;
  border: 0;
  background: none;
  background-color: ${colors.elementsBg};
  height: 15px;
  cursor: pointer;
  color: ${colors.text};
  font-size: ${fonts.extraSmallSize};
  border-radius: ${borders.borderRadius};
`;

const ExpandDeckGroupButton = styled(ControlButton)`
  margin-right: 5px;

  ${props => props.col ? 'position: absolute; right: 5px; top: 10px;' : '' }
`;

const DeckHelperButton = styled(ControlButton)`
  background-color: ${colors.primary};
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

/*
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
*/

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

const CardListAll = styled.section`
  article {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    align-content: start;
  }
`;

const CardListBox = styled.section`
  section {
    display: grid;
    grid-template-columns: ${(props) => props.single === true ? 'auto' : '70% 30%'};

    article {
      display: grid;
      grid-template-columns: ${(props) => props.single === true ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)'};
      align-content: start;
    }

    aside {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-content: start;
    }
  }
`;

const DeckHelperOverlay = styled.div`
  position: fixed;
  display: ${(props) => props.open === true ? 'grid' : 'none'};
  grid-template-columns: 70% 30%;
  padding: 20px;
  overflow: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${colors.blocksBg};
`;

const DeckHelperCloseButton = styled.button`
  display: inline-block;
  position: absolute;
  top: 30px;
  right: 30px;
  border: 0;
  background: none;
  background-color: ${colors.elementsBg};
  color: ${colors.text};
  font-size: ${fonts.size};
  text-align: center;
  width: 30px;
  height: 30px;
  line-height: 23px;
  border-radius: 50%;
  cursor: pointer;
`;

const NotesContainer = styled.div`
  margin-top: 30px;
`;

const NotesForm = styled.form`
  margin-top: 30px;
`;

const NotesContent = styled.div`
  margin-bottom: 15px;
`;

const NotesTextarea = styled.textarea`
  background: none;
  border: 1px solid ${colors.elementsBg};
  color: ${colors.text};
  display: block;
  width: 100%;
  resize: none;
  padding: 10px;
  margin-bottom: 15px;
  box-sizing: border-box;
`;

const DeckHelperMain = styled.main``;
const DeckHelperSub = styled.aside`
  padding-left: 50px;
`;

class ShowAdvices extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      decks: [],
      deckGroups: [],
      playedCards: [],
      removedCards: [],
      opponentMana: 0,
      activeCards: [],
      maxCounts: {},
      openedDeckGroups: [],
      filteredCards: [],
      notesArchetypeFormEdit: false,
      notesDeckFormEdit: false,
      notesEditArchetypeText: '',
      notesEditDeckText: '',
      deckHelperOpen: false,
      deckHelperTitle: '',
      deckHelperCards: [],
      deckHelperDescr: '',
      deckHelperExactDeck: false,
      deckHelperActiveDeck: null,
      deckHelperTotalGames: null,
      deckHelperDecksCount: null,
      currFilter: o => {
        return o.cost <= 1
      }
    }

    this.handleNotesArchetypeTextChange = this.handleNotesArchetypeTextChange.bind(this);
    this.handleNotesDeckTextChange = this.handleNotesDeckTextChange.bind(this);
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

  outputOddEvenOrNone() {
    const odd = this.findOdd();
    const even = this.findEven();

    return (
      <div>
        {odd && <button onClick={() => this.chooseOddOrEven(odd)}>Odd</button>}
        {even && <button onClick={() => this.chooseOddOrEven(even)}>Even</button>}
        {(odd || even) && <button onClick={() => this.chooseNotEvenNotOdd()}>None</button>}
      </div>
    )
  }

  resetFilter() {
    this.setState({
      filteredCards: this.state.activeCards,
      currFilter: {}
    })
  }

  chooseOddOrEven(card) {
    this.handleChooseCard(card);

    this.resetFilter();
  }

  findOdd() {
    return _filter(this.state.activeCards, { dbfId: 48158 })[0];
  }

  findEven() {
    return _filter(this.state.activeCards, { dbfId: 47693 })[0];
  }

  chooseNotEvenNotOdd() {
    const odd = _filter(this.state.activeCards, { dbfId: 48158 })[0];
    const even = _filter(this.state.activeCards, { dbfId: 47693 })[0];

    if (even) {
      this.handleRemoveCard(even);
    }
    if (odd) {
      this.handleRemoveCard(odd);
    }
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

  filterCardsAndDecks(cards, playedCards, removedCards) {
    const newDecks = this.updateActualDecks(playedCards, removedCards)
    cards = this.updateActiveCards(newDecks, playedCards, removedCards)
    const filteredCards = _filter(cards, this.state.currFilter);

    const groups = _groupBy(newDecks, (v) => {
      return v.archetypeId.name
    });

    this.setState({
      playedCards: playedCards,
      removedCards: removedCards,
      activeCards: cards,
      decks: newDecks,
      deckGroups: groups,
      filteredCards
    }, () => {
      if (this.state.deckHelperOpen === true) {
        this.updateDeckHelper(this.state.deckHelperActiveDeck)
      }
    });
  }

  handleChooseCard(card) {
    const playedCards = this.state.playedCards;
    const removedCards = this.state.removedCards;
    const playCount = _filter(this.state.playedCards, { dbfId: card.dbfId });
    const playedCard = card;
    playedCard.playCount = playCount.length + 1;
    let cards = this.state.activeCards;
    playedCards.push(playedCard);

    this.filterCardsAndDecks(cards, playedCards, removedCards);
  }

  handleRemoveCard(card) {
    const playedCards = this.state.playedCards;
    const removedCards = this.state.removedCards;
    let cards = this.state.activeCards;
    removedCards.push(card);

    this.filterCardsAndDecks(cards, playedCards, removedCards);
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

  outputCardList(cards) {
    return cards.map(card => {
      const image = getCardImageById(card.id);
      let leftCount = this.state.maxCounts[card.dbfId];

      if (this.state.playedCards.length > 0) {
        const pCard = _filter(this.state.playedCards, { dbfId: card.dbfId })
        if (pCard.length > 0) {
          leftCount = pCard.length;
        }
      }

      let cardPopularity = '';

      if (this.state.deckHelperTotalGames && card.games > 0) {
        const popPercent = (card.games / this.state.deckHelperTotalGames * 100).toFixed(1)
        const attention = popPercent >= 10;
        cardPopularity = <CardPopularity attention={attention} key={card.id}>{popPercent}%</CardPopularity>
      }

      return <CardChoice 
          key={card.id} 
        >
          <CardChoiceName>{card.name}</CardChoiceName>
          {/* <CardRemove onClick={() => this.handleRemoveCard(card)}>X</CardRemove> */}
          {(this.state.maxCounts[card.dbfId] === 2) ? <CardImageDuplicate src={image} /> : ''}
          <img onClick={() => this.handleChooseCard(card)} src={image} alt={card.name} />
          {cardPopularity}
        </CardChoice>
    })
  }

  outputCardGroupsList(cardsByGroup) {
    return ['MINION', 'SPELL', 'WEAPON', 'HERO'].map(type => {
      const cards = cardsByGroup[type];

      if (cards === undefined) return false;

      const cardsOutput = this.outputCardList(cards);

      return (
        <CardListAll key={type}>
          <h3>{type}</h3>
          <article>
            {cardsOutput}
          </article>
        </CardListAll>
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

  updateActiveCards(decks, playedCards, removedCards) {
    const newCards = [];
    const maxCounts = {};

    decks.forEach(deck => {
      deck.cards.forEach(card => {
        
        // const deckData = { name: deck.name, archetype: deck.archetypeId.name };
        // const deckGames = deck.totalGames || null;

        const diffCard = _filter(playedCards, { 'id': card.id })
        if (diffCard.length === 0 || diffCard.length < card.count) {
          const index = _findIndex(newCards, { 'id': card.id });

          if ( index === -1) {
            // card.decks = [deckData];
            
            // if (deckGames !== null) {
            //   card.games = deckGames;
            // }

            maxCounts[card.dbfId] = card.count - diffCard.length;

            newCards.push(card)
          } else {
            if (maxCounts[card.dbfId] === 1) {
              maxCounts[card.dbfId] = 2 - diffCard.length;
            }
          }
          // } else if ( newCards[index].count < 2 && card.count > 1 && newCards[index].rarity !== 'LEGENDARY' ) {
            // newCards[index].decks.push(deckData)

            // if (deckGames !== null) {
            //   newCards[index].games += deckGames;
            // }

            // newCards[index].count = 2;
          // } else {
            // newCards[index].decks.push(deckData)

            // if (deckGames !== null) {
            //   newCards[index].games += deckGames;
            // }
          // }
        }
      })
    })

    this.setState({
      maxCounts
    })

    return newCards;
  }

  componentDidMount() {
    const oppClass = this.props.currentGame.opponentClass;
    const newDecks = _filter(this.props.decks, { charClass: oppClass[0].toUpperCase() + oppClass.substring(1) });
    const tmpDecks = newDecks;
    const newCards = this.updateActiveCards(tmpDecks, this.state.playedCards, this.state.removedCards);
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

  expandDeckGroup(key) {
    const openedDeckGroups = this.state.openedDeckGroups;
    openedDeckGroups.push(key);

    const deckGroupsTmp = this.state.deckGroups;
    const sortedDeckGroups = this.sortKeysBy(deckGroupsTmp, function (value, key) {
      return openedDeckGroups.indexOf(key) !== -1;
    });

    this.setState({
      deckGroups: sortedDeckGroups,
      openedDeckGroups
    })
  }

  collapseDeckGroup(key) {
    let openedDeckGroups = this.state.openedDeckGroups;
    const i = openedDeckGroups.indexOf(key);

    openedDeckGroups.splice(i, 1);

    const deckGroupsTmp = this.state.deckGroups;
    const sortedDeckGroups = this.sortKeysBy(deckGroupsTmp, function (value, key) {
      return openedDeckGroups.indexOf(key) !== -1;
    });

    this.setState({
      deckGroups: sortedDeckGroups,
      openedDeckGroups
    })
  }

  outputDeck(deck) {
    const games = deck.totalGames;
    
    return <DeckVariant 
      key={deck._id}>
      <DeckVariantChooseButton onClick={() => this.handleChooseOppDeck(deck._id)}>{games}</DeckVariantChooseButton>
      <DeckHelperButton onClick={() => this.handleDeckHelperButton(deck, true)}>HLP</DeckHelperButton>
    </DeckVariant>
  }

  sortKeysBy(obj, comparator) {
    var sortedKeys = _sortBy(_keys(obj), function (key) {
        return comparator ? comparator(obj[key], key) : key;
    });

    return _fromPairs(
      _map(sortedKeys, key => [key, obj[key]])
    )
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
        <DeckVariantList>
          {Object.keys(this.state.deckGroups).map((key) => {
            const group = _sortBy(this.state.deckGroups[key], o => {
              const games = o.totalGames;
              return games;
            }).reverse();

            const opened = this.state.openedDeckGroups.indexOf(key) === -1;
            const groupOutput = opened ? (
              <div>
                <DeckGroupCount>{group.length}</DeckGroupCount>
                <ExpandDeckGroupButton onClick={() => this.expandDeckGroup(key)}>EXP</ExpandDeckGroupButton>
                <DeckHelperButton onClick={() => this.handleDeckHelperButton(group[0], false)}>HLP</DeckHelperButton>
              </div>
            ) : <div>
                  <ExpandDeckGroupButton col={true} onClick={() => this.collapseDeckGroup(key)}>COL</ExpandDeckGroupButton>
                  {group.map(deck => {
                    return this.outputDeck(deck)
                  })}
                </div>;

            let output = (
              <DeckGroup open={!opened} key={key}>
                <span>{key}</span>
                {groupOutput}
              </DeckGroup>
            );

            if (group.length <= 3) {
              output = (
                <DeckGroup open={true} key={key}>
                  <span>{key}</span>
                  <div>
                    {group.map(deck => {
                      return this.outputDeck(deck)
                    })}
                  </div>
                </DeckGroup>
              )
            }

            return output;
          })}
        </DeckVariantList>
      </div>
    )
  }

  handleChooseOppDeck(id) {
    const deck = _find(this.state.decks, { '_id': id })
    const cards = this.updateActiveCards([deck], this.state.playedCards, this.state.removedCards)
    const filteredCards = _filter(cards, this.state.currFilter);

    this.setState({
      decks: [deck],
      deckGroups: [],
      openedDeckGroups: [],
      activeCards: cards,
      filteredCards
    }, () => {
      this.props.updateGameOpponentDeck({
        variables: { opponentDeck: id }
      })
    });
  }

  updateActualDecks(playedCards, removedCards) {
    const decks = this.state.decks;
    const leftDecks = [];
    const filteredOutDecks = [];

    decks.forEach((dck) => {
      let av = true;

      playedCards.forEach(c => {
        const card = _find(dck.cards, { 'dbfId': c.dbfId })
        
        if (card === undefined || card.count < c.playCount) {
          av = false
        }
      })
      removedCards.forEach(c => {
        const i = _findIndex(dck.cards, { 'id': c.id })
        if (i !== -1) {
          av = false
        }
      })

      if (av) {
        leftDecks.push(dck);
      } else {
        filteredOutDecks.push(dck)
      }
    })

    if (decks.length === 0) {
      alert('NO ACTIVE DECKS')
    }

    return leftDecks
  }

  updateDeckHelperMainCards(oldCards, playedCards) {
    const newCards = [];

    oldCards.forEach(card => {
      const diffCard = _filter(playedCards, { dbfId: card.dbfId })
      if (diffCard.length === 0 || (diffCard.length === 1 && card.count === 2)) { newCards.push(card) }
    });

    return newCards;
  }

  differCards(sourceStack, diffStack) {
    const outputStack = [];

    sourceStack.forEach(card => {
      const diffCardIndex = _findIndex(diffStack, { dbfId: card.dbfId })
      if (diffCardIndex === -1) outputStack.push(card)
    });

    return outputStack;
  }

  updateDeckHelper(deck, openExactDeck) {
    const archetype = deck.archetypeId.name;
    const decks = _sortBy(this.state.deckGroups[archetype], ['totalGames']).reverse()
    const mostPopularDeck = decks[0];
    const targetDeck = openExactDeck === true ? deck : mostPopularDeck;

    if (!targetDeck) {
      this.handleDeckHelperCloseButton();
      return false;
    }

    const totalGames = decks.reduce((acc, val) => { return acc + val.totalGames }, 0)

    const mainCards = this.updateDeckHelperMainCards(targetDeck.cards, this.state.playedCards);
    const targetIndex = decks.indexOf(targetDeck);
    const otherDecks = decks;
    otherDecks.splice(targetIndex, 1);
    const allArchCards = this.updateActiveCards(otherDecks, this.state.playedCards, this.state.removedCards)
    const allOtherCards = this.differCards(allArchCards, mainCards)

    this.setState({
      deckHelperExactDeck: openExactDeck,
      deckHelperActiveDeck: targetDeck,
      deckHelperDecksCount: decks.length,
      deckHelperTitle: targetDeck.archetypeId.name,
      deckHelperCards: mainCards,
      deckHelperDescr: targetDeck.archetypeId.key_features,
      deckOtherCards: allOtherCards,
      deckHelperTotalGames: totalGames,
      notesEditArchetypeText: targetDeck.archetypeId.notes,
      notesEditDeckText: targetDeck.notes
    })
  }

  handleDeckHelperButton(deck, openExactDeck) {
    this.setState({
      deckHelperOpen: true
    })

    this.updateDeckHelper(deck, openExactDeck)
  }

  handleDeckHelperCloseButton() {
    this.setState({
      deckHelperOpen: false
    })
  }

  renderDeckHelper() {
    const cards = _sortBy(this.state.deckHelperCards, ['cost']);
    const otherCards = _sortBy(this.state.deckOtherCards, ['cost']);
    const cardsOutput = this.outputCardList(cards);
    const otherCardsOutput = this.outputCardList(otherCards);
    const single = this.state.deckHelperDecksCount === 1;
    const opponentInfo = this.outputOpponentGameInfo();
    const ShowAndEditNotes = this.showNotesForm();

    return (
      <DeckHelperOverlay open={this.state.deckHelperOpen}>
        <DeckHelperCloseButton onClick={() => this.handleDeckHelperCloseButton()}>x</DeckHelperCloseButton>
        <DeckHelperMain>
          <CardListBox single={single}>
            <h3>{this.state.deckHelperTitle} ({this.state.deckHelperActiveDeck && this.state.deckHelperActiveDeck.totalGames})</h3>
            <p>{this.state.deckHelperDescr}</p>
            {opponentInfo}
            <section>
              <article>
                {cardsOutput}
              </article>
              <aside>
                {otherCardsOutput}
              </aside>
            </section>
          </CardListBox>
        </DeckHelperMain>
        <DeckHelperSub>
          <Button onClick={() => this.handleChooseOppDeck(this.state.deckHelperActiveDeck._id)}>This is the deck</Button>
          <ChooseOutcome />
          {ShowAndEditNotes}
        </DeckHelperSub>
      </DeckHelperOverlay>
    )
  }
  
  handleNotesArchetypeTextChange(event) {
    this.setState({
      notesEditArchetypeText: event.target.value
    });
  }
  
  handleNotesDeckTextChange(event) {
    this.setState({
      notesEditDeckText: event.target.value
    });
  }

  outputArchetypeNotesForm() {
    return <Mutation 
      mutation={updateArchetypeNotes}
    >
      {(mutation, { loading, error, data, client }) => {
        if (data && data.updateArchetypeNotes && data.updateArchetypeNotes._id) {
          this.setState({
            notesArchetypeFormEdit: false
          })
        }

        const variables = {
          id: this.state.deckHelperActiveDeck.archetypeId._id,
          notes: this.state.notesEditArchetypeText
        };
        
        return (
          <NotesForm
            onSubmit={e => {
              e.preventDefault();
              mutation({ variables });
            }}
          >
            <NotesTextarea onChange={this.handleNotesArchetypeTextChange} value={this.state.notesEditArchetypeText}></NotesTextarea>
            <Button primary type="submit">Save notes</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </NotesForm>
        )
      }}
    </Mutation>;
  }

  outputDeckNotesForm() {
    return <Mutation 
      mutation={updateDeckNotes}
    >
      {(mutation, { loading, error, data, client }) => {
        if (data && data.updateDeckNotes && data.updateDeckNotes._id) {
          this.setState({
            notesDeckFormEdit: false
          })
        }

        const variables = {
          id: this.state.deckHelperActiveDeck._id,
          notes: this.state.notesEditDeckText
        };
        
        return (
          <NotesForm
            onSubmit={e => {
              e.preventDefault();
              mutation({ variables });
            }}
          >
            <NotesTextarea onChange={this.handleNotesDeckTextChange} value={this.state.notesEditDeckText}></NotesTextarea>
            <Button primary type="submit">Save notes</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </NotesForm>
        )
      }}
    </Mutation>;
  }

  showNotesForm() {
    return (
      <NotesContainer>
        <NotesContent>
          <h3>Archetype notes:</h3>
          <div dangerouslySetInnerHTML={{__html: this.state.notesEditArchetypeText}}></div>
        </NotesContent>
        <SmallButton onClick={() => this.setState({ notesArchetypeFormEdit: !this.state.notesArchetypeFormEdit })}>Toggle</SmallButton>
        {this.state.notesArchetypeFormEdit && this.outputArchetypeNotesForm()}
        <NotesContent>
          <h3>Deck notes:</h3>
          <div dangerouslySetInnerHTML={{__html: this.state.notesEditDeckText}}></div>
        </NotesContent>
        <SmallButton onClick={() => this.setState({ notesDeckFormEdit: !this.state.notesDeckFormEdit })}>Toggle</SmallButton>
        {this.state.notesDeckFormEdit && this.outputDeckNotesForm()}
      </NotesContainer>
    )
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentClass || currentGame.mulligan.length < 3 || currentGame.outcome ) return false;

    const OddEvenOrNone = this.outputOddEvenOrNone();
    const cardsFilter = this.outputCardsFilter();
    const cardsList = this.outputAllCardsByDeck(this.state.filteredCards);
    const opponentInfo = this.outputOpponentGameInfo();
    const expectedDecks = this.outputExpectedDecks();
    const deckHelper = this.renderDeckHelper();

    return (
      <div>
        {expectedDecks}
        {opponentInfo}
        {OddEvenOrNone}
        {cardsFilter}
        {cardsList}
        {deckHelper}
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

