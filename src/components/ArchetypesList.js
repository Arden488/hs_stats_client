import React from 'react';
import { Query, Mutation } from "react-apollo";
import getArchetype from '../graphql/getArchetype';
import createArchetype from '../graphql/createArchetype';
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

const NewArchetypeForm = styled.form`
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

const ChooseArchetypeButton = styled(Button)`
  margin-bottom: 5px;
  margin-right: 5px;
`;

const GroupHeading = styled.h4`
  text-transform: uppercase;
`;

class ArchetypesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeArchetype: null,
      form: {
        name: '',
        code: '',
        key_features: '',
        charClass: ''
      },
      newFormOpen: false
    }

    this.resetActiveArchetype = this.resetActiveArchetype.bind(this);
    this.handleOpenNewForm = this.handleOpenNewForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  outArchetypesByClasses(archetypes) {
    const byClasses = _groupBy(archetypes, 'charClass');
    
    return _map(byClasses, (archs, charClass) => {
      return (
        <div key={charClass}>
          <GroupHeading>{`${charClass}`}</GroupHeading>
          {this.outputArchetypes(archs)}
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

  outputAllCardsByArchetype(code) {
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

  outputArchetypeInfo(archetype) {
    return (
      <div>
        <h2>{archetype.name}</h2>
        <p>{archetype.key_features}</p>
      </div>
    )
  }

  outputArchetypeDetails(arch) {
    const cards = this.outputAllCardsByArchetype(arch.code);
    const archetypeInfo = this.outputArchetypeInfo(arch);

    return (
      <div>
        {archetypeInfo}
        <p>
          <LargeButton onClick={this.resetActiveArchetype}>Back</LargeButton>
        </p>
        {cards}
        <p>
          <LargeButton onClick={this.resetActiveArchetype}>Back</LargeButton>
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

  outputForm() {
    return <Mutation 
      mutation={createArchetype}
      refetchQueries={['allArchetypes']}
    >
      {(createArchetype, { loading, error, data, client }) => {
        if (data && data.createArchetype._id) {
          this.setState({
            newFormOpen: false
          })
        }
        
        return (
          <NewArchetypeForm 
            onSubmit={e => {
              e.preventDefault();
              createArchetype({ variables: { 
                name: this.state.form.name,
                code: this.state.form.code,
                key_features: this.state.form.key_features,
                charClass: this.state.form.charClass
              } });
            }}
          >
            <h3>New archetype</h3>
            <input placeholder="Name" type="text" name="name" value={this.state.form.name} onChange={this.handleInputChange} />
            <input placeholder="Code" type="text" name="code" value={this.state.form.code} onChange={this.handleInputChange} />
            <input placeholder="Class" type="text" name="charClass" value={this.state.form.charClass} onChange={this.handleInputChange} />
            <textarea placeholder="Key features" name="key_features" value={this.state.form.key_features} onChange={this.handleInputChange} />
            <Button type="submit">Save game</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </NewArchetypeForm>
        )
      }}
    </Mutation>;
  }

  addNewForm() {
    return this.state.newFormOpen ? 
      <div>{this.outputForm()}</div> :
      <p><LargeButton onClick={this.handleOpenNewForm}>Add new</LargeButton></p>
  }

  showArchetypeDetails(id) {
    return (
      <Query
        query={getArchetype}
        variables={{ id }}
      >
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          return (
            <div>
              {this.outputArchetypeDetails(data.getArchetype)}
            </div>
          )
        }}
      </Query>
    )
  }

  selectActiveArchetype(id) {
    this.setState({
      activeArchetype: id
    })
  }

  resetActiveArchetype() {
    this.setState({
      activeArchetype: null
    })
  }

  outputArchetypes(archs) {
    return archs.map(arch => {
      return (
        <ChooseArchetypeButton
          onClick={() => this.selectActiveArchetype(arch._id)} 
          key={arch._id}
        >
          {arch.name}
        </ChooseArchetypeButton>
      );
    })
  }

  showAllArchetypes() {
    return (
      <Query
        query={gql`
          {
            allArchetypes {
              _id,
              name,
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
              {this.outArchetypesByClasses(data.allArchetypes)}
              {this.addNewForm()}
            </div>
          )
        }}
      </Query>
    )
  }

  render() {
    return this.state.activeArchetype ? 
      this.showArchetypeDetails(this.state.activeArchetype) :
      this.showAllArchetypes();
  }
}

export default ArchetypesList;
