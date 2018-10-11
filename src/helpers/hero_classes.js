import { find } from 'lodash';

const classes = [
  { name: 'warrior', id: 'HERO_01' },
  { name: 'shaman', id: 'HERO_02' },
  { name: 'rogue', id: 'HERO_03' },
  { name: 'paladin', id: 'HERO_04' },
  { name: 'hunter', id: 'HERO_05' },
  { name: 'druid', id: 'HERO_06' },
  { name: 'warlock', id: 'HERO_07' },
  { name: 'mage', id: 'HERO_08' },
  { name: 'priest', id: 'HERO_09' }
];

function getHeroImageById(id) {
  return `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${id}.png`;
}

function getListOfClasses() {
  return classes.map(item => {
    item.heroImage = getHeroImageById(item.id);
    return item;
  });
}

function getHeroByName(name) {
  const heroClass = find(classes, { 'name': name });
  heroClass.heroImage = getHeroImageById(heroClass.id);
  
  return heroClass;
}

export { getListOfClasses, getHeroByName }
