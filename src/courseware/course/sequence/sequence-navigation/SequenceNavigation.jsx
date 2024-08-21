import React from 'react';
import PropTypes from 'prop-types';
import {
  breakpoints, Button, useArrowKeyNavigation, useWindowSize,
} from '@edx/paragon';
import { ChevronLeft, ChevronRight } from '@edx/paragon/icons';
import classNames from 'classnames';
import {
  injectIntl,
  intlShape,
  isRtl,
  getLocale,
} from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

import messages from './messages';

const SequenceNavigation = ({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseExitPage,
}) => {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;

  const prevArrow = isRtl(getLocale()) ? ChevronRight : ChevronLeft;

  const parentRef = useArrowKeyNavigation({
    selectors: 'button:not(:disabled)',
    ignoredKeys: ['ArrowUp', 'ArrowDown'],
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const PreviousButton = () => (
    <Button
      variant="link"
      className="previous-btn"
      aria-label="previous-btn"
      onClick={previousSequenceHandler}
      disabled={isFirstUnit}
      iconBefore={prevArrow}
      role="tabpanel"
      tabIndex={-1}
      aria-controls={intl.formatMessage(messages.previousButton)}
      id={intl.formatMessage(messages.previousButton)}
      aria-labelledby={intl.formatMessage(messages.previousButton)}
    >
      {shouldDisplayNotificationTriggerInSequence ? null : intl.formatMessage(messages.previousButton)}
    </Button>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const NextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : nextSequenceHandler;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    const nextArrow = isRtl(getLocale()) ? ChevronLeft : ChevronRight;

    return (
      <Button
        variant="link"
        className="next-btn"
        aria-label="next-btn"
        onClick={buttonOnClick}
        disabled={disabled}
        iconAfter={nextArrow}
        role="tabpanel"
        tabIndex={-1}
        aria-controls={shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        id={shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        aria-labelledby={shouldDisplayNotificationTriggerInSequence ? null : buttonText}
      >
        {shouldDisplayNotificationTriggerInSequence ? null : buttonText}
      </Button>
    );
  };

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <React.Fragment ref={parentRef}>
          <PreviousButton />
          <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
          <NextButton />
        </React.Fragment>
      );
    }
    if (sequence.unitIds.length === 0 || unitId === null) {
      return (
        <React.Fragment ref={parentRef}>
          <PreviousButton />
          <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
          <NextButton />
        </React.Fragment>
      );
    }
    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds}
        unitId={unitId}
        showCompletion={sequence.showCompletion}
        onNavigate={onNavigate}
        previousButton={<PreviousButton />}
        nextButton={<NextButton />}
      />
    );
  };

  return sequenceStatus === LOADED && (
    <nav
      id="courseware-sequenceNavigation"
      className={classNames('sequence-navigation', className)}
      style={{ width: shouldDisplayNotificationTriggerInSequence ? '90%' : null }}
      aria-label="course sequence tabs"
    >
      {renderUnitButtons()}
    </nav>
  );
};

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};

export default injectIntl(SequenceNavigation);
