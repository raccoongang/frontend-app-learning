import React from 'react';
import { Factory } from 'rosie';
import { initializeTestStore, render } from '../../../../setupTest';
import UnitIcon from './UnitIcon';
import { UNIT_ICON_TYPES } from './constants';

describe('Unit Icon', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = UNIT_ICON_TYPES.map(contentType => Factory.build(
    'block',
    { id: contentType, type: contentType },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
  });

  unitBlocks.forEach(block => {
    it(`renders correct icon for ${block.type} unit`, () => {
      // Suppress warning for undefined prop type.
      if (block.type === 'undefined') {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      }

      const { container } = render(<UnitIcon type={block.type} />);
      UNIT_ICON_TYPES.forEach(type => {
        if (type !== block.type) {
          expect(container.querySelector('.pgn__icon')).not.toHaveTextContent(UNIT_ICON_TYPES[type]);
        }
      });
    });
  });
});
