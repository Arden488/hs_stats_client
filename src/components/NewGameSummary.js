import React from 'react';
import { withRouter, Redirect } from "react-router-dom";
import { Mutation, Query, compose, graphql } from 'react-apollo';
import { uniqBy as _uniqBy } from 'lodash';

import getCurrentGame from '../graphql/getCurrentGame';
import updateCurrentSession from '../graphql/updateCurrentSession';
import getCurrentSession from '../graphql/getCurrentSession';
import getOppDeck from '../graphql/getOppDeck';
import createGameAndUpdateWinrate from '../graphql/createGameAndUpdateWinrate';
import resetGame from '../graphql/resetGame';
import getWinratesByClass from '../graphql/getWinratesByClass';

import { getData } from '../helpers/storage_utils';
import { colors, spacers, fonts } from '../styles/vars';
import { LargeButton } from '../styles/buttons';
import styled from 'styled-components'
import { getWinrateColor } from '../helpers/misc_utils';
import { getHeroByName, getHeroImageById } from '../helpers/hero_classes';
import { getCardImageById } from '../helpers/cards_api';

const GameSummary = styled.section`
  box-sizing: border-box;
  max-width: ${props => props.isStatic ? '350px' : 'none'};
`;

const GameSummaryHeader = styled.header`
  background: ${props => props.isStatic ? 'none' : colors.blocksBg};
  padding: ${spacers.paddings.x1} ${spacers.paddings.x2};
`;

const GameSummaryContent = styled.article`
  padding: ${spacers.paddings.x1} ${spacers.paddings.x2};
`;

const ChosenClass = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;

  img {
    max-width: 100%;
  }

  h3 {
    text-transform: capitalize;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: ${fonts.smallSize}
  }

  span {
    display: block;
  }
`;

const OutcomeColored = styled.span`
  color: ${props => props.outcome === 'victory' ? colors.success : colors.failure }
`;

const MulliganChosen = styled.img`
  width: 25%
`;

const DeckWinrate = styled.p`
  span {
    color: ${props => props.color || colors.text};
  }
`;

class NewGameSummary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    }

    this.handleGameSummaryVisibility = this.handleGameSummaryVisibility.bind(this); 
  }

  outputWinrate(winrates) {
    let games = 0;
    let wins = 0;

    winrates.forEach(wr => {
      games += wr.games;
      wins += wr.wins;
    });

    const winrate = `${((wins/games) * 100).toFixed(2)}%`;

    return <DeckWinrate color={getWinrateColor(winrate)}>
      <span>{winrate}</span>
      {games} games
    </DeckWinrate>
  }

  outputOppDeck(deck) {
    if ( !deck ) {
      return <span>Empty</span>;
    }

    return (
      <Query
        query={getOppDeck}
        variables={{ id: deck }}
      >
        {({ loading, error, data }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return `Error!: ${error}`;

          this.archetype = data.getOppDeck.name;

          return (
            <span>{data.getOppDeck.name}</span>
          );
        }}
      </Query>
    )
  }

  updateSession(outcome) {
    const session = this.props.currentSession;
    const up = { wins: session.wins, losses: session.losses }
    if (outcome === 'victory') {
      up.wins++
    } else {
      up.losses++
    }

    this.props.updateCurrentSession({
      variables: { wins: up.wins, losses: up.losses }
    })
  }

  outputSaveButton(game) {
    if ( !game.opponentClass || !game.opponentDeck || !game.outcome || game.mulligan.length < 3 ) {
      return null;
    }

    const deckId = getData('deck').id;

    return (
      <Mutation 
        mutation={createGameAndUpdateWinrate}
        refetchQueries={['getWinratesByClass']}
      >
        {(createGameAndUpdateWinrate, { loading, error, data, client }) => {
          if (data && data.createGame._id) {
            this.updateSession(game.outcome)
            this.props.resetGame()
            return <div><Redirect to={`/`} /></div>;
          }

          const mulligan = _uniqBy(game.mulligan, 'cardId').map(card => {
            card = { cardId: card.cardId }
            return card;
          });
          
          return (
            <div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  createGameAndUpdateWinrate({ variables: { 
                    deckId,  
                    opponentClass: game.opponentClass, 
                    opponentDeck: game.opponentDeck, 
                    outcome: game.outcome,
                    mulligan: mulligan
                  } });
                }}
              >
                <LargeButton primary type="submit">Save game</LargeButton>
              </form>
              {loading && <p>Loading...</p>}
              {error && <p>Error :( Please try again</p>}
            </div>
          )
        }}
      </Mutation>
    )
  }

  outputClassWinrate(opponentClass) {
    return <Query 
      query={getWinratesByClass} 
      variables={{ deckId: getData('deck').id, opponentClass }}
    >
      {({ loading, error, data }) => {
        if (loading) return <span>Loading...</span>;
        if (error) return <span>Error: {error}</span>;

        return this.outputWinrate(data.getWinratesByClass);
      }}
    </Query>
  }

  handleGameSummaryVisibility() {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const { currentGame } = this.props;

    const SaveButton = this.outputSaveButton(currentGame);
    let chosenClass = 'Choose class to see information';
    let chosenMulligan = '';
    let chosenOppDeck = '';
    let chosenOutcome = '';

    if (currentGame.opponentClass) {
      const ClassWinrate = this.outputClassWinrate(currentGame.opponentClass);
      const hero = getHeroByName(currentGame.opponentClass);
      const heroImage = getHeroImageById(hero.id);

      chosenClass = (
        <ChosenClass>
          <img width='150' src={heroImage} alt={currentGame.opponentClass} />
          <div>
            <h3>{currentGame.opponentClass}</h3>
            {ClassWinrate}
          </div>
        </ChosenClass>
      );
    }

    if (currentGame.mulligan.length > 0) {
      const mulligan = currentGame.mulligan.map((card, i) => {
        return <MulliganChosen 
          src={getCardImageById(card.cardId)} 
          key={`${card.cardId}_${i}`} 
          title={card.cardName} 
          alt={card.cardName} 
        />
      });
      chosenMulligan = <p><strong>Mulligan:</strong><br />{mulligan}</p>;
    }

    if (currentGame.opponentDeck) {
      const OppDeck = this.outputOppDeck(currentGame.opponentDeck);
      chosenOppDeck = <p><strong>Opponent archetype:</strong> {OppDeck}</p>;
    }

    if (currentGame.outcome) {
      chosenOutcome = <p><strong>Outcome:</strong> <OutcomeColored outcome={currentGame.outcome}>{currentGame.outcome}</OutcomeColored></p>;
    }


    return (
      <GameSummary isOpen={this.state.isOpen} isStatic={currentGame.outcome !== null}>
        <GameSummaryHeader onClick={this.handleGameSummaryVisibility} isStatic={currentGame.outcome !== null}>
          <h3>Game summary</h3>
        </GameSummaryHeader>

        <GameSummaryContent>
          {chosenClass}
          {chosenMulligan}
          {chosenOppDeck}
          {chosenOutcome}

          {SaveButton}
        </GameSummaryContent>
      </GameSummary>
    )
  }
}

export default compose(
  withRouter,
  graphql(resetGame, { name: 'resetGame' }),
  graphql(updateCurrentSession, { name: 'updateCurrentSession' }),
  graphql(getCurrentSession, {
    props: ({ data: { currentSession } }) => ({
      currentSession
    })
  }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  }),
)(NewGameSummary);
