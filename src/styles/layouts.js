import styled from 'styled-components'
import { spacers } from './vars';

const Wrapper = styled.section`
  max-width: 1000px;
  margin: auto;
  padding: ${spacers.margins.x3} ${spacers.paddings.x2} ${spacers.baseSpacer * 12}px;
`;

export { Wrapper };
