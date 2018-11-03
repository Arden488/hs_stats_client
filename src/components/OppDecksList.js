import React from 'react';
import { Query, Mutation } from "react-apollo";
import getOppDeck from '../graphql/getOppDeck';
import createOppDeck from '../graphql/createOppDeck';
import updateOppDeck from '../graphql/updateOppDeck';
import gql from "graphql-tag";
import { 
  groupBy as _groupBy, 
  map as _map,
  findIndex as _findIndex,
  sortBy as _sortBy
} from 'lodash';
import { decodeDeck } from '../helpers/deck_codes_utils';
import { getCardImageById } from '../helpers/cards_api';
import { getCardById } from '../helpers/cards_api';

import styled from 'styled-components'
import { Button, LargeButton } from '../styles/buttons';
import allArchetypes from '../graphql/allArchetypes';

const CardList = styled.div`
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  text-align: center;

  img {
    max-width: 100%;
  }
`;

const DeckForm = styled.form`
  input[type=text],
  select,
  textarea {
    display: block;
    margin-bottom: 10px;
    width: 100%;
    padding: 9px 10px;
    box-sizing: border-box;
    border: 0;
  }
`;

const ChooseOppDeckButton = styled(Button)`
  margin-bottom: 5px;
  margin-right: 5px;
`;

const GroupHeading = styled.h4`
  text-transform: uppercase;
`;

class OppDecksList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeDeck: null,
      form: {
        name: '',
        code: '',
        archetypeId: '',
        key_features: '',
        charClass: ''
      },
      formOpen: false
    }

    this.resetActiveOppDeck = this.resetActiveOppDeck.bind(this);
    this.handleOpenForm = this.handleOpenForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  outOppDecksByClasses(decks) {
    const groupsSorted = _sortBy(decks, (o) => {
      return o.charClass
    })
    const groups = _groupBy(groupsSorted, (v) => {
      return v.archetypeId.name
    });
    
    return Object.keys(groups).map((key) => {
      const group = groups[key]
      return (
        <div key={key}>
          <GroupHeading>{`${key}`}</GroupHeading>
          {this.outputOppDecks(group)}
        </div>
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

  outputAllCardsByOppDeck(code) {
    const deckData = decodeDeck(code);
    let cards = this.fetchDeckCards(deckData.cards);

    cards = _sortBy(cards, ['cost']);

    const cardsOutput = this.outputCardList(cards);

    return (
      <CardList>
        {cardsOutput}
      </CardList>
    )
  }

  outputCardList(cards) {
    return cards.map(card => {
      const image = getCardImageById(card.id);

      return <Card key={card.id}>
        <img src={image} alt={card.name} />
        <span>{card.name}</span>
      </Card>
    })
  }

  outputOppDeckInfo(deck) {
    return (
      <div>
        <h2>{deck.name}</h2>
        <h2>{deck.archetypeId.name}</h2>
        <p>{deck.key_features}</p>
      </div>
    )
  }

  outputOppDeckDetails(arch) {
    const cards = this.outputAllCardsByOppDeck(arch.code);
    const deckInfo = this.outputOppDeckInfo(arch);

    return (
      <div>
        {deckInfo}
        <p>
          <LargeButton onClick={this.resetActiveOppDeck}>Back</LargeButton>
        </p>
        {cards}
        <div>
          {this.addForm('update', arch)}
          {this.state.formOpen ? '' : <Button onClick={this.handleOpenForm}>Edit deck</Button>}
        </div>
        <p>
          <LargeButton onClick={this.resetActiveOppDeck}>Back</LargeButton>
        </p>
      </div>
    )
  }

  handleOpenForm() {
    this.setState({
      formOpen: true
    })
  }

  handleInputChange(event) {
    const newState = { form: this.state.form };
    newState.form[event.target.name] = event.target.value;

    this.setState(newState);
  }

  outputForm(type, deckData, archetypes) {
    const mutationType = type === 'create' ? createOppDeck : updateOppDeck;
    const mutationTypeName = mutationType.definitions[0].name.value;

    return <Mutation 
      mutation={mutationType}
      refetchQueries={['allOppDecks', 'getOppDeck']}
    >
      {(mutation, { loading, error, data, client }) => {
        if (data && data[mutationTypeName] && data[mutationTypeName]._id) {
          this.setState({
            formOpen: false
          })
        }

        const variables = {};

        if (type === 'update') {
          variables.id = this.state.activeDeck
          archetypes = archetypes.filter(a => a.charClass === this.state.form.charClass)
          if (_findIndex(archetypes, { _id: this.state.form.archetypeId }) === -1) {
            archetypes.unshift({ _id: '0', name: 'Choose one' })
          }
        }

        variables.name = this.state.form.name;
        variables.code = this.state.form.code;
        variables.archetypeId = this.state.form.archetypeId;
        variables.key_features = this.state.form.key_features;
        variables.charClass = this.state.form.charClass;
        
        return (
          <DeckForm 
            onSubmit={e => {
              e.preventDefault();
              mutation({ variables });
            }}
          >
            <h3>{type === 'create' ? 'New deck' : `Edit deck '${deckData.name}'`}</h3>
            <input placeholder="Name" type="text" name="name" value={this.state.form.name} onChange={this.handleInputChange} />
            <input placeholder="Code" type="text" name="code" value={this.state.form.code} onChange={this.handleInputChange} />
            <input placeholder="Class" type="text" name="charClass" value={this.state.form.charClass} onChange={this.handleInputChange} />
            <select placeholder="Archetype" name="archetypeId" value={this.state.form.archetypeId} onChange={this.handleInputChange}>
              {archetypes.map(arch => <option key={arch._id} value={arch._id}>{arch.name}</option>)}
            </select>
            <textarea placeholder="Key features" name="key_features" value={this.state.form.key_features} onChange={this.handleInputChange} />
            <Button type="submit">Save deck</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </DeckForm>
        )
      }}
    </Mutation>;
  }
 
  addForm(type, deckData) {
    return this.state.formOpen ? 
      <Query query={allArchetypes}>
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          return (
            <div>{this.outputForm(type, deckData, data.allArchetypes)}</div>
          )
        }}
      </Query> : '';
      
  }

  showDeckDetails(id) {
    return (
      <Query
        query={getOppDeck}
        variables={{ id }}
      >
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          return (
            <div>
              {this.outputOppDeckDetails(data.getOppDeck)}
            </div>
          )
        }}
      </Query>
    )
  }

  selectActiveOppDeck(deck) {
    this.setState({
      activeDeck: deck._id,
      form: {
        name: deck.name,
        archetypeId: deck.archetypeId._id,
        charClass: deck.charClass,
        key_features: deck.key_features,
        code: deck.code
      }
    })
  }

  resetActiveOppDeck() {
    this.setState({
      formOpen: false,
      activeDeck: null,
      form: {
        name: '',
        code: '',
        archetypeId: '',
        key_features: '',
        charClass: ''
      }
    })
  }

  outputOppDecks(decks) {
    return decks.map(deck => {
      return (
        <ChooseOppDeckButton
          onClick={() => this.selectActiveOppDeck(deck)} 
          key={deck._id}
        >
          {deck.name}
        </ChooseOppDeckButton>
      );
    })
  }

  showAllDecks() {
    return (
      <Query
        query={gql`
          {
            allOppDecks {
              _id,
              name,
              code,
              archetypeId {
                _id,
                charClass,
                name
              },
              charClass,
              key_features
            }
          }
        `}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;

          return (
            <div>
              {this.outOppDecksByClasses(data.allOppDecks)}
              {this.addForm('create', null)}
              <p>
                <LargeButton onClick={this.handleOpenForm}>Add new deck</LargeButton>
              </p>
            </div>
          )
        }}
      </Query>
    )
  }

  render() {
    return this.state.activeDeck ? 
      this.showDeckDetails(this.state.activeDeck) :
      this.showAllDecks();
  }
}

export default OppDecksList;
