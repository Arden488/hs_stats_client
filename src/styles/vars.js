const baseColors = {
  blue: '#06bfff',
  green: '#0fcc4e',
  purple: '#706fc7',
  white: '#ffffff',
  black: '#090909',
  grayLight: '#6e6e6e',
  grayLightOpaque: 'rgba(110, 110, 110, .5)',
  grayMedium: '#262626',
  grayDark: '#161616'
}

const colors = {
  primary: baseColors.blue,
  secondary: baseColors.green,
  third: baseColors.purple,
  text: baseColors.white,
  textFade: baseColors.grayLight,
  contrast: baseColors.black,
  background: baseColors.black,
  layoutBg: baseColors.grayDark,
  blocksBg: baseColors.grayMedium,
  elementsBg: baseColors.grayLight,
  elementsBgLoading: baseColors.grayLightOpaque
}

const fonts = {
  size: '16px',
  largeSize: '24px',
  smallSize: '14px',
  extraSmallSize: '10px',
  lineHeight: '1.3',
  largeLineHeight: '1.8',
  smallLineHeight: '1'
}

const borders = {
  borderRadius: '5px',
  largeBorderRadius: '15px'
}

const spacers = {
  baseSpacer: 10,
  margins: {
    x1: '10px',
    x2: '20px',
    x3: '30px'
  },
  paddings: {
    x1: '10px',
    x2: '20px',
    x3: '30px'
  }
}

export { colors, spacers, borders, fonts }
