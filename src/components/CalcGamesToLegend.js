import React from 'react';

import styled from 'styled-components'
import { fonts, spacers, colors } from '../styles/vars';

const StatsBlock = styled.div`
  display: inline-block;
  text-transform: uppercase;
  font-size: ${fonts.extraSmallSize};
  margin-right: ${spacers.baseSpacer * 4}px;

  span {
    display: block;
    font-size: ${fonts.extraLargeSize};
    color: ${props => props.color || colors.text};
  }
`;

/*
Number.prototype.niceFormat = function(i, t, scale) {
  var n = this;
  i = isNaN(i = Math.abs(i)) ? 2 : i;
  scale = void 0 == scale ? "." : scale;
  t = void 0 == t ? "," : t;
  var sign = 0 > n ? "-" : "";
  var val = parseInt(n = Math.abs(+n || 0).toFixed(i)) + "";
  var j = 3 < (j = val.length) ? j % 3 : 0;
  return sign + (j ? val.substr(0, j) + t : "") + val.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (i ? scale + Math.abs(n - val).toFixed(i).slice(2) : "");
}
*/

class CalcGamesToLegend extends React.Component {
  /*
  constructor(props) {
    super(props);

    
    this.initialInRank = 0;
    this.winRate = .55;
    this.samples = [];
    this.size = 1e4;
    this.maxRuns = 1e3;
    this.sampleDurations = [];
    this.percentiles = [];

    this.state = {
      games: 0
    }
    
  }

  run() {
    var k = 0;

    function sample() {
      this.initialInRank = 0;
      this.winRate = .55;
      this.runs = 0;
      this.results = [];
      this.ranks = [];
      this.maxRuns = 1e3;
    }

    sample.prototype.init = function(domElem, e, undefined) {
      this.initialInRank = void 0 !== domElem ? domElem : this.toInRank(this.props.rank, this.props.stars);
      this.winRate = void 0 !== e ? e : .01 * this.props.winrate;
      this.maxRuns = void 0 !== undefined ? undefined : 1000;
      this.runs = 0;
      this.results = [];
      this.ranks = [];
    }
    
    sample.prototype.simulateOneGame = function() {
      return Math.random() < this.winRate ? 1 : 0;
    }
    
    sample.prototype.run = function() {
      var item = 0;
      var n = this.initialInRank;
      var e = 0;
      for (; e < this.maxRuns && (this.runs++, item = this.simulateOneGame(), this.results.push(item), 1 === item ? n++ : 0 === item && 16 < n && 31 != n && 51 != n && 76 != n && n--, 3 <= this.runs && 85 >= n && 1 === item && 1 === this.results[this.runs - 2] && 1 === this.results[this.runs - 3] && n++, this.ranks.push(n), 101 !== n); e++) {
      }
    }

    for (; k < this.size; k++) {
      var obj = new sample;
      obj.init(this.initialInRank, this.winRate, this.maxRuns);
      obj.run();
      this.samples.push(obj);
      this.sampleDurations.push(obj.runs);
    }
    this.sampleDurations.sort(function(tablebits, i) {
      return tablebits - i;
    });
    // this.calcPercentiles();

    const games = this.average();

    this.setState({
      games
    })
  }

  toInRank(lfs, selectIndex) {
    var inRankArray = [[101, 101, 101, 101, 101, 101], [96, 97, 98, 99, 100, 100], [91, 92, 93, 94, 95, 95], [86, 87, 88, 89, 90, 90], [81, 82, 83, 84, 85, 85], [76, 77, 78, 79, 80, 80], [71, 72, 73, 74, 75, 75], [66, 67, 68, 69, 70, 70], [61, 62, 63, 64, 65, 65], [56, 57, 58, 59, 60, 60], [51, 52, 53, 54, 55, 55], [47, 48, 49, 50, 50, 50], [43, 44, 45, 46, 46, 46], [39, 40, 41, 42, 42, 42], [35, 36, 37, 38, 38, 38], [31, 32, 33, 34, 34, 34], [28, 29, 30, 30, 30, 30], [25, 26, 27, 27, 27, 27], [22, 23, 
      24, 24, 24, 24], [19, 20, 21, 21, 21, 21], [16, 17, 18, 18, 18, 18], [13, 14, 15, 15, 15, 15], [10, 11, 12, 12, 12, 12], [7, 8, 9, 9, 9, 9], [4, 5, 6, 6, 6, 6], [1, 2, 3, 3, 3, 3]];
      
    return inRankArray[Math.max(Math.min(lfs, 25), 0)][Math.max(Math.min(selectIndex, 5), 0)];
  }

  average() {
    var sumRuns = 0;
    var i = 0;
    for (; i < this.size; i++) {
      sumRuns = sumRuns + this.samples[i].runs;
    }
    return 1 * sumRuns / this.size;
  }

  init() {
    this.initialInRank = this.toInRank(this.props.rank, this.props.stars);
    this.winRate = .01 * this.props.winrate;
    this.maxRuns = 1000;
    this.samples = [];
    this.sampleDurations = [];
    this.percentiles = [];
    this.distribution = [];
  }

  componentDidMount() {
    this.init();
    this.run();
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (this.props != newProps) {
      this.init();
      this.run();
    }
  }

  */

  getGamesLeft() {
    const gamesInitialToPlay = 40;
    let resultGamesToPlay = gamesInitialToPlay;
    const dateObj = new Date();
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();

    const today = dd + '.' + mm + '.' + yyyy;

    const storeForDate = JSON.parse( localStorage.getItem(today) );

    resultGamesToPlay = gamesInitialToPlay - (storeForDate.wins + storeForDate.losses);
    
    return resultGamesToPlay;
  }

  render() {
    const gameLeftToday = this.getGamesLeft();
    // const gamesToLegend = this.state.games.niceFormat(0);
    // const gamesToLegend = Math.floor( (this.props.starsToLegend * 100) / (2 * this.props.winrate - 100) );

    return (
      <StatsBlock>
        <span>{gameLeftToday}</span> left today
      </StatsBlock>
    )
  }
}

export default CalcGamesToLegend;
