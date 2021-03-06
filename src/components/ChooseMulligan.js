import React from 'react';

import { 
  times as _times, 
  filter as _filter, 
  sortBy as _sortBy
} from 'lodash';
import { getData } from '../helpers/storage_utils';
import { getCardImageById } from '../helpers/cards_api';
import { Query, compose, graphql } from 'react-apollo';
import updateGameMulligan from '../graphql/updateGameMulligan';
import getCurrentGame from '../graphql/getCurrentGame';
import getWinratesByClass from '../graphql/getWinratesByClass';

import styled from 'styled-components'
import { LargeButton } from '../styles/buttons';
import { colors, spacers } from '../styles/vars';
import { getWinrateColor } from '../helpers/misc_utils';

const ActionBlock = styled.div`
  text-align: center;
  padding: ${spacers.paddings.x2}
`;

const MulliganWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 200px;
  align-items: center;
`;

const MulliganChosenList = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => `${props.count}, minmax(100px, 256px)` });
  grid-column-gap: ${spacers.baseSpacer * 1}px
`;

const MulliganPlaceholder = styled.div`
  width: 256px;
  height: 382px;
  max-width: 100%;
  max-height: 18vw;
  background: ${colors.layoutBg}
`;

const MulliganChosen = styled.button`
  background: none;
  border: 0;
  display: block;
  width: 256px;
  height: 382px;
  max-width: 100%;
  max-height: 18vw;

  img {
    display: block;
    margin: auto;
    max-width: 100%;
    max-height: 100%;
  }
`;

const MulliganCardList = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
`;

const CardWinrate = styled.p`
  margin: 0;
  text-align: center;

  span {
    color: ${props => props.color || colors.text};
  }
`;

const MulliganCardChoice = styled.button`
  background: none;
  border: 0;  
  color: ${colors.text};

  span + span {
    display: block;
    color: ${colors.textFade}
  }

  img {
    display: inline-block;
    background-image: url(images/card_placeholder.png);
    background-size: contain;
    width: 150px;
    max-width: 100%;
  }
`;

class ChooseMulligan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mulliganCount: 4,
      mulligan: []
    }

    this.handleMulliganApprove = this.handleMulliganApprove.bind(this);
  }

  calculateCardWinrate(stats) {
    let cardsWrs = {};
    
    stats.forEach(wr => {
      wr.cards.forEach(card => {
        const ex = cardsWrs[card.cardId];
        
        if (ex) {
          ex.wins = ex.wins + card.wins;
          ex.losses = ex.losses + card.losses;
        } else {
          cardsWrs[card.cardId] = { wins: card.wins, losses: card.losses }
        }
      });
    });

    return cardsWrs;
  }

  outputCardWinrate(winrateStats) {
    if(winrateStats) {
      const games = winrateStats.wins + winrateStats.losses;
      const winrate = `${((winrateStats.wins/games) * 100).toFixed(2)}%`;
      return (
        <CardWinrate color={getWinrateColor(winrate)}>
          <span>{winrate}</span>
          <span>(W: {winrateStats.wins}/ L: {winrateStats.losses})</span>
        </CardWinrate>
      )
    }

    return 'N/A';
  }

  outputCardList(opponentClass) {
    let cardsArray = getData('deck').cards;

    return (
      <div>
        <p>Choose your mulligan:</p>
        <MulliganCardList>
          <Query 
            query={getWinratesByClass} 
            variables={{ deckId: getData('deck').id, opponentClass }}
          >
            {({ loading, error, data }) => {
              if (loading) return <span>Loading...</span>;
              if (error) return <span>Error: {error}</span>;

              const cardWinrates = this.calculateCardWinrate(data.getWinratesByClass);

              cardsArray = _sortBy(cardsArray, [o => {
                const wr = cardWinrates[o.id];
                if (!wr) {
                  return -1 - o.cost;
                }

                const winrate = ((wr.wins/(wr.wins + wr.losses)) * 100).toFixed(2) - o.cost;
                return winrate
              }]).reverse();

              const cards = cardsArray.map(card => {
                const image = getCardImageById(card.id);
                const ex = _filter(this.state.mulligan, { cardId: card.id });

                const winrateData = cardWinrates[card.id];
                const winrate = this.outputCardWinrate(winrateData);
              
                if(ex && ex.length === card.count) {
                  return false;
                }
          
                return (
                  <MulliganCardChoice key={card.id} onClick={() => this.handleChooseMulligan(card)}>
                    <img width="150" src={image} alt={card.name} />
                    {winrate}
                  </MulliganCardChoice>
                );
              });

              return cards;
            }}
          </Query>
        </MulliganCardList>
      </div>
    )
  }

  handleChooseMulligan(card) {
    const mulligan = this.state.mulligan;
    
    if (mulligan.length === this.state.mulliganCount) {
      return false;
    }

    const chosen = _filter(this.state.mulligan, { 'id': card.id })
    
    if ( chosen.length < card.count && this.state.mulligan.length < this.state.mulliganCount ) {
      mulligan.push({ cardId: card.id, cardName: card.name, __typename: 'Card' });
    }

    this.setState({
      mulligan
    });
  }

  outputMulliganPlaceholders() {
    const placeholders = _times(this.state.mulliganCount, (i) => {
        const card = this.state.mulligan[i];

        if ( !card) {
          return <MulliganPlaceholder key={i} />;
        }

        const cardImage = getCardImageById(card.cardId);

        return (
          <MulliganChosen key={i}>
            <img src={cardImage} alt={card.cardName} />
          </MulliganChosen>
        )
    });

    return (
      <MulliganWrapper>
        <MulliganChosenList count={this.state.mulliganCount}>
          {placeholders}
        </MulliganChosenList>
        <ActionBlock>
          {this.state.mulligan.length >= 3 && <LargeButton primary onClick={this.handleMulliganApprove}>Done</LargeButton>}
        </ActionBlock>
      </MulliganWrapper>
    )
  }

  handleMulliganApprove() {
    if (this.state.mulligan.length > 2 && this.state.mulligan.length < 5) {
      this.props.updateGameMulligan({
        variables: { mulligan: this.state.mulligan }
      })
    }
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentClass || currentGame.mulligan.length > 0 ) return false;

    const cards = this.state.mulliganCount === this.state.mulligan.length ? false : this.outputCardList(currentGame.opponentClass);
    // const order = this.outputOrderVariants();
    const mulliganChosen = this.outputMulliganPlaceholders();
    
    return (
      <div>
        {mulliganChosen}
        {cards}
      </div>
    );
  }
}

export default compose(
  graphql(updateGameMulligan, { name: 'updateGameMulligan' }),
  graphql(getCurrentGame, {
    props: ({ data: { currentGame } }) => ({
      currentGame
    })
  })
)(ChooseMulligan);
