import {encode, decode} from "deckstrings";

function encodeDeck(deck) {
  return encode(deck);
}

function decodeDeck(deckstring) {
  return decode(deckstring);
}

export { encodeDeck, decodeDeck }
