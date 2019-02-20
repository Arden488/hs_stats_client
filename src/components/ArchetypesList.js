import React from 'react';
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { 
  groupBy as _groupBy, 
  map as _map,
} from 'lodash';

import getArchetype from '../graphql/getArchetype';
import createArchetype from '../graphql/createArchetype';
import updateArchetype from '../graphql/updateArchetype';

import styled from 'styled-components'
import { Button, LargeButton } from '../styles/buttons';

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

class ArchetypesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeArchetype: null,
      form: {
        name: '',
        key_features: '',
        charClass: ''
      },
      formOpen: false
    }

    this.resetActiveArchetype = this.resetActiveArchetype.bind(this);
    this.handleOpenForm = this.handleOpenForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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

  outputForm(type, archData) {
    const mutationType = type === 'create' ? createArchetype : updateArchetype;
    const mutationTypeName = mutationType.definitions[0].name.value;

    return <Mutation 
      mutation={mutationType}
      refetchQueries={['allArchetypes']}
    >
      {(mutation, { loading, error, data, client }) => {
        if (data && data[mutationTypeName] && data[mutationTypeName]._id) {
          this.setState({
            formOpen: false
          })
        }

        const variables = {};

        if (type === 'update') {
          variables.id = this.state.activeArchetype
        }

        variables.name = this.state.form.name;
        variables.key_features = this.state.form.key_features;
        variables.charClass = this.state.form.charClass;
        
        return (
          <DeckForm 
            onSubmit={e => {
              e.preventDefault();
              mutation({ variables });
            }}
          >
            <h3>{type === 'create' ? 'New deck' : `Edit deck '${archData.name}'`}</h3>
            <input placeholder="Name" type="text" name="name" value={this.state.form.name} onChange={this.handleInputChange} />
            <input placeholder="Class" type="text" name="charClass" value={this.state.form.charClass} onChange={this.handleInputChange} />
            <textarea placeholder="Key features" name="key_features" value={this.state.form.key_features} onChange={this.handleInputChange} />
            <Button type="submit">Save archetype</Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </DeckForm>
        )
      }}
    </Mutation>;
  }
 
  addForm(type, archData) {
    return this.state.formOpen ? 
      this.outputForm(type, archData) : '';
      
  }

  outputArchetypeInfo(archetype) {
    return (
      <div>
        <h2>{archetype.name}</h2>
        <p>{archetype.charClass}</p>
        <p>{archetype.key_features}</p>
      </div>
    )
  }

  outputArchetypeDetails(arch) {
    const archetypeInfo = this.outputArchetypeInfo(arch);

    return (
      <div>
        {archetypeInfo}
        <p>
          <LargeButton onClick={this.resetActiveArchetype}>Back</LargeButton>
        </p>
        <div>
          {this.addForm('update', arch)}
          {this.state.formOpen ? '' : <Button onClick={this.handleOpenForm}>Edit deck</Button>}
        </div>
        <p>
          <LargeButton onClick={this.resetActiveArchetype}>Back</LargeButton>
        </p>
      </div>
    )
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

  selectActiveArchetype(deck) {
    this.setState({
      activeArchetype: deck._id,
      form: {
        name: deck.name,
        charClass: deck.charClass,
        key_features: deck.key_features
      }
    })
  }

  resetActiveArchetype() {
    this.setState({
      formOpen: false,
      activeArchetype: null,
      form: {
        name: '',
        key_features: '',
        charClass: ''
      }
    })
  }

  outputArchetypes(archetypes) {
    return archetypes.map(archetype => {
      return (
        <ChooseOppDeckButton
          onClick={() => this.selectActiveArchetype(archetype)} 
          key={archetype._id}
        >
          {archetype.name}
        </ChooseOppDeckButton>
      );
    })
  }

  outputArchetypesByClasses(archetypes) {
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

  showAllArchetypes() {
    return (
      <Query
        query={gql`
          {
            allArchetypes {
              _id,
              name,
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
              {this.outputArchetypesByClasses(data.allArchetypes)}
              {this.addForm('create', null)}
              <p>
                <LargeButton onClick={this.handleOpenForm}>Add new archetype</LargeButton>
              </p>
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

export default ArchetypesList
