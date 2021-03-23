import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { getCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';
import SidebarNotificationButton from '../../SidebarNotificationButton';

import messages from './messages';
/** [MM-P2P] Experiment */
import { MMP2PFlyoverTriggerMobile } from '../../../../experiments/mm-p2p';

function SequenceNavigation({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseExitPage,
  toggleSidebar,
  isSidebarVisible,
  isResponsiveWidth,
  mmp2p,
}) {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
      );
    }
    if (sequence.unitIds.length === 0 || unitId === null) {
      return (
        <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
      );
    }
    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds}
        unitId={unitId}
        showCompletion={sequence.showCompletion}
        onNavigate={onNavigate}
      />
    );
  };

  const renderNextButton = () => {
    const { exitActive, exitText } = getCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : nextSequenceHandler;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    return (
      <Button variant="link" className="next-btn" onClick={buttonOnClick} disabled={disabled}>
        {!isResponsiveWidth ? buttonText : null}
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    );
  };

  return sequenceStatus === LOADED && (
    <nav className={classNames('sequence-navigation', className)}>
      <Button variant="link" className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        {!isResponsiveWidth ? intl.formatMessage(messages.previousButton) : null}
      </Button>
      {renderUnitButtons()}
      {renderNextButton()}

      {isResponsiveWidth ? (
        <SidebarNotificationButton
          toggleSidebar={toggleSidebar}
          isSidebarVisible={isSidebarVisible}
        />
      ) : null}

      {/** [MM-P2P] Experiment */}
      { mmp2p.state.isEnabled && <MMP2PFlyoverTriggerMobile options={mmp2p} /> }
      <div className="rev1512ToggleFlyoverSequenceLocation" />
    </nav>
  );
}

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
  toggleSidebar: PropTypes.func,
  isSidebarVisible: PropTypes.func,
  isResponsiveWidth: PropTypes.bool,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
  }),
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
  toggleSidebar: null,
  isSidebarVisible: null,
  isResponsiveWidth: null,

  /** [MM-P2P] Experiment */
  mmp2p: {
    state: { isEnabled: false },
  },
};

export default injectIntl(SequenceNavigation);
