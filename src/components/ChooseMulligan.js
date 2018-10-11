import React from 'react';

import { times as _times, find as _find, filter as _filter } from 'lodash';
import { getData } from '../helpers/storage_utils';
import { getCardImageById } from '../helpers/cards_api';
import { Query, compose, graphql } from 'react-apollo';
import updateGameMulligan from '../graphql/updateGameMulligan';
import getCurrentGame from '../graphql/getCurrentGame';
import getWinratesByClass from '../graphql/getWinratesByClass';

class ChooseMulligan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mulliganCount: 3,
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
        <span>{winrate} (W: {winrateStats.wins}/ L: {winrateStats.losses}/ G: {games})</span>
      )
    }

    return 'N/A';
  }

  outputCardList(opponentClass) {
    const cardsArray = getData('deck').cards;

    return <Query 
      query={getWinratesByClass} 
      variables={{ deckId: getData('deck').id, opponentClass }}
    >
      {({ loading, error, data }) => {
        if (loading) return <span>Loading...</span>;
        if (error) return <span>Error: {error}</span>;

        const cardWinrates = this.calculateCardWinrate(data.getWinratesByClass);

        const cards = cardsArray.map(card => {
          const image = getCardImageById(card.id);
          const ex = _filter(this.state.mulligan, { cardId: card.id });

          const winrate = this.outputCardWinrate(cardWinrates[card.id]);
        
          if(ex && ex.length === card.count) {
            return false;
          }
    
          return (
            <button key={card.id} onClick={() => this.handleChooseMulligan(card)}>
              <img width="100" src={image} alt={card.name} />
              <span>{winrate}</span>
            </button>
          );
        });

        return cards;
      }}
    </Query>
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

  handleChooseOrder(value) {
    this.setState({
      mulliganCount: value === 'first' ? 3 : 4
    });
  }

  outputOrderVariants() {
    return (
      <div>
        <button onClick={() => this.handleChooseOrder('first')}>First</button>
        <button onClick={() => this.handleChooseOrder('second')}>Second</button>
      </div>
    )
  }

  outputMulliganPlaceholders() {
    const placeholders = _times(this.state.mulliganCount, (i) => {
        const card = this.state.mulligan[i];

        if ( !card) {
          return 'Empty';
        }

        const cardImage = getCardImageById(card.cardId);

        return (
          <div key={i}>
            <img src={cardImage} alt={card.cardName} />
          </div>
        )
    });

    return (
      <div>
        {placeholders}
      </div>
    )
  }

  handleMulliganApprove() {
    if (this.state.mulligan.length === this.state.mulliganCount) {
      this.props.updateGameMulligan({
        variables: { mulligan: this.state.mulligan }
      })
    }
  }

  render() {
    const { currentGame } = this.props;

    if ( !currentGame.opponentClass || currentGame.mulligan.length > 0 ) return false;

    const cards = this.state.mulliganCount === this.state.mulligan.length ? false : this.outputCardList(currentGame.opponentClass);
    const order = this.outputOrderVariants();
    const mulliganChosen = this.outputMulliganPlaceholders();
    
    return (
      <div>
        <p>First or second?:</p>
        {order}
        <p>Choose your mulligan:</p>
        {mulliganChosen}
        {cards}
        <button onClick={this.handleMulliganApprove}>Done</button>
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
