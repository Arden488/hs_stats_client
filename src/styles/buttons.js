import styled from 'styled-components'
import { colors, spacers, borders, fonts } from './vars';

const Button = styled.button`
  background-color: ${props => props.primary ? colors.primary : colors.elementsBg};
  border-radius: ${borders.borderRadius};
  border: none;
  cursor: pointer;
  font-size: ${fonts.size};
  color: ${colors.text};
  padding: ${spacers.paddings.x1} ${spacers.paddings.x2};
  transition: box-shadow .2s, transform .2s, background-color .2s;

  :active {
    transform: translateY(1px);
  }

  :focus {
    outline: 0;
    box-shadow: 0 2px 5px 0px rgba(0,0,0,.2);
  }

  :hover {
    box-shadow: 0 2px 5px 0px rgba(0,0,0,.2);
  }
`;

const SmallButton = styled(Button)`
  padding: 0 ${spacers.paddings.x1};
  margin-left: 10px;
`;

const LargeButton = styled(Button)`
  padding: ${spacers.paddings.x2} ${spacers.paddings.x3};
  font-size: ${fonts.largeSize};
`;

export { Button, LargeButton, SmallButton }
