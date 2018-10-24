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
import getArchetypesByClass from '../graphql/getArchetypesByClass';
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
      archetypes: [],
      playedCards: [],
      opponentMana: 0,
      activeCards: []
    }

    this.increaseMana = this.increaseMana.bind(this);
  }

  outputAllCardsByArchetype(cards) {
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

  componentDidUpdate() {
    console.log('Show Advices componentDidUpdate')
  }

  outputExpectedArchetypes(archetypes) {
    const archs = [];
    const matches = {};
    archetypes.forEach((el, i) => {
      const v = el.name.search(/v[0-9]+/g);
      let x = el.name;
      if (v !== -1) {
        x = el.name.slice(0, v-1);
      }

      if (archs.indexOf(x) === -1) {
        archs.push(el)
      } else {
        if (!matches[i]) { matches[i] = 1 }
        matches[i] = matches[i]+1;
      }
    });

    return (
      <div>
        <h4>Expected archetypes:</h4>
        {archs.map((a, i) => {
          return (
            <p><strong>{a.name}</strong> {matches[i] && <span>({matches[i]} sim.)</span>}<br />{a.key_features}</p>
          )
        })}
      </div>
    )
  }

  updateActualArchetypes(cards, archetypes) {
    archetypes.forEach((arch, index) => {
      if (cards.length > 0) {
        cards.forEach(c => {
          const i = _findIndex(arch.cards, { 'id': c.id })
          if (i === -1) {
            archetypes.splice(index, 1)
          }
        })
      }
    })

    return archetypes
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentClass || currentGame.mulligan.length < 3 || currentGame.outcome ) return false;
    
    this.archetypes = _filter(this.props.archetypes, { charClass: currentGame.opponentClass })
    let cardsList;
    let cards = [];

    this.archetypes.forEach(arch => {
      console.log('Show Advices render foreach')
      cards = arch.cards.concat(cards)
    })

    cards = _uniqBy(cards, 'id');

    cardsList = this.outputAllCardsByArchetype(cards);
    const opponentInfo = this.outputOpponentGameInfo();
    this.archetypes = this.updateActualArchetypes(this.state.playedCards, this.archetypes);
    const expectedArchetypes = this.outputExpectedArchetypes(this.archetypes);

    console.log(this.archetypes)

    return (
      <div>
        {expectedArchetypes}
        {opponentInfo}
        {cardsList}
      </div>
    )
    
    // return <Query query={getArchetypesByClass} variables={{ charClass: currentGame.opponentClass }}>
    //   {({ loading, error, data, client }) => {
    //     if (loading) return <p>Loading...</p>;
    //     if (error) return <p>Error: {error}</p>;

    //     console.log(archetypes);
    //     console.log('start fetchAllCards: 0/' + data.getArchetypeByClass.length);

    //     // const opponentGameInfo = this.outputOpponentGameInfo();
    //     if ( archetypes === null ) {
    //       archetypes = this.fetchAllCards(data.getArchetypeByClass);
    //       console.log(archetypes);
    //     }
    //     // this.setState(archetypes);
    //     // const archetypeInfo = this.outputArchetypeInfo(data.getArchetype);
    //   }}
    // </Query>
  }
}

export default compose(
  // graphql(getArchetypesByClass, { name: 'getArchetypesByClass' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ShowAdvices);

