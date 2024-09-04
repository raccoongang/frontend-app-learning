import React from 'react';
import PropTypes from 'prop-types';
import { useArrowKeyNavigation } from '@edx/paragon';

import UnitButton from './UnitButton';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';

const SequenceNavigationTabs = ({
  unitIds, unitId, showCompletion, onNavigate, previousButton, nextButton,
}) => {
  const parentRef = useArrowKeyNavigation({
    selectors: 'button:not(:disabled)',
    ignoredKeys: ['ArrowUp', 'ArrowDown'],
  });

  const [
    indexOfLastVisibleChild,
    containerRef,
    invisibleStyle,
  ] = useIndexOfLastVisibleChild();

  const shouldDisplayDropdown = indexOfLastVisibleChild === -1;

  return (
    <div style={{ flexBasis: '100%', minWidth: 0 }}>
      <div className="sequence-navigation-tabs-container" ref={containerRef}>
        <div
          className="sequence-navigation-tabs d-flex flex-grow-1"
          style={shouldDisplayDropdown ? invisibleStyle : null}
          role="tablist"
          ref={parentRef}
        >
          {previousButton}
          {unitIds.map((buttonUnitId, idx) => (
            <UnitButton
              key={buttonUnitId}
              unitId={buttonUnitId}
              isActive={unitId === buttonUnitId}
              showCompletion={showCompletion}
              onClick={onNavigate}
              unitIndex={idx}
            />
          ))}
          {nextButton}
        </div>
      </div>
      {shouldDisplayDropdown && (
        <SequenceNavigationDropdown
          unitId={unitId}
          onNavigate={onNavigate}
          showCompletion={showCompletion}
          unitIds={unitIds}
        />
      )}
    </div>
  );
};

SequenceNavigationTabs.propTypes = {
  unitId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  previousButton: PropTypes.node.isRequired,
  nextButton: PropTypes.node.isRequired,
};

export default SequenceNavigationTabs;
