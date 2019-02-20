import { find } from 'lodash';

function getCardById(id) {
  const data = localStorage.getItem('hsjson-28855_enUS');
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
