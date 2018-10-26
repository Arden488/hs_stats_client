import React from 'react';
import { Query, Mutation } from "react-apollo";
import getOppDeck from '../graphql/getOppDeck';
import createOppDeck from '../graphql/createOppDeck';
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

const NewDeckForm = styled.form`
  input[type=text],
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
      newFormOpen: false
    }

    this.resetActiveOppDeck = this.resetActiveOppDeck.bind(this);
    this.handleOpenNewForm = this.handleOpenNewForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  outOppDecksByClasses(decks) {
    const byClasses = _groupBy(decks, 'charClass');
    
    return _map(byClasses, (dcks, charClass) => {
      return (
        <div key={charClass}>
          <GroupHeading>{`${charClass}`}</GroupHeading>
          {this.outputOppDecks(dcks)}
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
        <p>
          <LargeButton onClick={this.resetActiveOppDeck}>Back</LargeButton>
        </p>
      </div>
    )
  }

  handleOpenNewForm() {
    this.setState({
      newFormOpen: true
    })
  }

  handleInputChange(event) {
    const newState = { form: this.state.form };
    newState.form[event.target.name] = event.target.value;

    this.setState(newState);
  }

  outputForm(archetypes) {
    return <Mutation 
      mutation={createOppDeck}
      refetchQueries={['allOppDecks']}
    >
      {(createOppDeck, { loading, error, data, client }) => {
        if (data && data.createOppDeck._id) {
          this.setState({
            newFormOpen: false
          })
        }
        
        return (
          <NewDeckForm 
            onSubmit={e => {
              e.preventDefault();
              createOppDeck({ variables: { 
                name: this.state.form.name,
                code: this.state.form.code,
                archetypeId: this.state.form.archetypeId,
                key_features: this.state.form.key_features,
                charClass: this.state.form.charClass
              } });
            }}
          >
            <h3>New deck</h3>
            <input placeholder="Name" type="text" name="name" value={this.state.form.name} onChange={this.handleInputChange} />
            <input placeholder="Code" type="text" name="code" value={this.state.form.code} onChange={this.handleInputChange} />
            <input placeholder="Class" type="text" name="charClass" value={this.state.form.charClass} onChange={this.handleInputChange} />
            <select placeholder="Archetype" name="archetypeId" value={this.state.form.archetypeId} onChange={this.handleInputChange}>
              {archetypes.map(arch => <option key={arch._id} value={arch.id}>{arch.name}</option>)}
            </select>
            <textarea placeholder="Key features" name="key_features" value={this.state.form.key_features} onChange={this.handleInputChange} />
            <Button type="submit">Save game</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </NewDeckForm>
        )
      }}
    </Mutation>;
  }

  addNewForm() {
    return this.state.newFormOpen ? 
    <Query query={allArchetypes}>
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          return (
            <div>{this.outputForm(data.allArchetypes)}</div>
          )
        }}
      </Query> :
      <p><LargeButton onClick={this.handleOpenNewForm}>Add new</LargeButton></p>
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

  selectActiveOppDeck(id) {
    this.setState({
      activeDeck: id
    })
  }

  resetActiveOppDeck() {
    this.setState({
      activeDeck: null
    })
  }

  outputOppDecks(decks) {
    return decks.map(deck => {
      return (
        <ChooseOppDeckButton
          onClick={() => this.selectActiveOppDeck(deck._id)} 
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
              archetypeId {
                name
              },
              charClass
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
              {this.addNewForm()}
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
