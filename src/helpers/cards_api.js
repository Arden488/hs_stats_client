import { find } from 'lodash';

function getCardById(id) {
  let cardsDataKey;
  for (var i = 0; i < localStorage.length; i++){
    if (localStorage.key(i).indexOf('hsjson-') !== -1) {
      cardsDataKey = localStorage.key(i);
    }
  }

  if (!cardsDataKey) {
    return;
  }

  const data = localStorage.getItem(cardsDataKey);
  const cards = JSON.parse(data).cards;

  const card = find(cards, { 'dbfId': id });

  return card;
}

function getCardImageById(id, size = '256') {
  return `https://art.hearthstonejson.com/v1/render/latest/enUS/${size}x/${id}.png`;
}

function getCardTileById(id) {
  return `https://art.hearthstonejson.com/v1/tiles/${id}.png`;
}

export { getCardById, getCardImageById, getCardTileById };
