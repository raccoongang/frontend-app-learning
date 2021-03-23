import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../generic/user-messages';
import useAccessExpirationAlert from '../../alerts/access-expiration-alert';
import useOfferAlert from '../../alerts/offer-alert';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import ContentTools from './content-tools';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import SidebarNotificationButton from './SidebarNotificationButton';

import CourseSock from '../../generic/course-sock';
import { useModel } from '../../generic/model-store';
import useWindowSize from '../../generic/tabs/useWindowSize';

/** [MM-P2P] Experiment */
import { initCoursewareMMP2P, MMP2PBlockModal } from '../../experiments/mm-p2p';

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
}) {
  const course = useModel('coursewareMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  const {
    accessExpiration,
    canShowUpgradeSock,
    celebrations,
    offer,
    org,
    userTimezone,
    verifiedMode,
  } = course;

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offer, userTimezone, 'course');
  const accessExpirationAlert = useAccessExpirationAlert(accessExpiration, userTimezone, 'course');

  const dispatch = useDispatch();
  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(
    courseId, sequenceId, unitId, celebrateFirstSection, dispatch, celebrations,
  );

  /** [MM-P2P] Experiment */
  const MMP2P = initCoursewareMMP2P(courseId, sequenceId, unitId);

  const windowSize = useWindowSize();
  const isResponsiveWidth = windowSize.width <= 768;

  const [sidebarVisible, setSidebar] = useState(false);
  const isSidebarVisible = () => sidebarVisible && setSidebar;
  const toggleSidebar = () => {
    if (!sidebarVisible) { setSidebar(true); } else { setSidebar(false); }
  };

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      { /** This conditional is for the [MM-P2P] Experiment */}
      { !MMP2P.state.isEnabled && (
        <AlertList
          className="my-3"
          topic="course"
          customAlerts={{
            ...accessExpirationAlert,
            ...offerAlert,
          }}
        />
      )}
      <div className="breadcrumb-container">
        <CourseBreadcrumbs
          courseId={courseId}
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          //* * [MM-P2P] Experiment */
          mmp2p={MMP2P}
        />
        { !isResponsiveWidth ? (
          <SidebarNotificationButton
            toggleSidebar={toggleSidebar}
            isSidebarVisible={isSidebarVisible}
          />
        ) : null}
      </div>

      <AlertList topic="sequence" />
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
        toggleSidebar={toggleSidebar}
        isSidebarVisible={isSidebarVisible}
        sidebarVisible={sidebarVisible}
        isResponsiveWidth={isResponsiveWidth}
        //* * [MM-P2P] Experiment */
        mmp2p={MMP2P}
      />
      {celebrationOpen && (
        <CelebrationModal
          courseId={courseId}
          open
        />
      )}
      {canShowUpgradeSock && (
        <CourseSock
          courseId={courseId}
          offer={offer}
          orgKey={org}
          pageLocation="Course Content Page"
          verifiedMode={verifiedMode}
        />
      )}
      <ContentTools course={course} />
      { /** [MM-P2P] Experiment */ }
      { MMP2P.meta.modalLock && <MMP2PBlockModal options={MMP2P} /> }
    </>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

export default Course;
