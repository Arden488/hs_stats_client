import React from 'react';

import { times as _times, find as _find, filter as _filter } from 'lodash';
import { getData } from '../helpers/storage_utils';
import { getCardImageById } from '../helpers/cards_api';
import { compose, graphql } from 'react-apollo';
import updateGameMulligan from '../graphql/updateGameMulligan';
import getCurrentGame from '../graphql/getCurrentGame';

class ChooseMulligan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mulliganCount: 3,
      mulligan: []
    }

    this.handleMulliganApprove = this.handleMulliganApprove.bind(this);
  }

  outputCardList() {
    const cardsArray = getData('deck').cards;
    // console.log(this.state.mulligan);
    const cards = cardsArray.map(card => {
      const image = getCardImageById(card.id);
      const ex = _filter(this.state.mulligan, { cardId: card.id });
    
      if(ex && ex.length === card.count) {
        return false;
      }

      return (
        <button key={card.id} onClick={() => this.handleChooseMulligan(card)}>
          <img width="100" src={image} alt={card.name} />
        </button>
      );
    });

    return cards;
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

    const cards = this.state.mulliganCount === this.state.mulligan.length ? false : this.outputCardList();
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
