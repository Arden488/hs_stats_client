import HearthstoneJSON from "hearthstonejson-client";
import { find } from 'lodash';

const hsjson = new HearthstoneJSON();  
hsjson.get('26996');

function getCardById(id) {
  const data = localStorage.getItem('hsjson-26996_enUS');
  const cards = JSON.parse(data).cards;

  const card = find(cards, { 'dbfId': id });

  return card;
}

export { getCardById };
