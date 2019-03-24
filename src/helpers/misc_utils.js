import { colors } from "../styles/vars";

function getWinrateColor(stat) {
  let color = colors.text;
  stat = parseInt(stat);

  if (stat >= 53) {
    color = colors.success;
  } else if (stat >= 50) {
    color = colors.warning;
  } else if (stat < 50) {
    color = colors.failure;
  }

  return color;
}

export { getWinrateColor }