import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import React, { useContext, useEffect } from 'react';
import { useModel } from '../../../../../generic/model-store';
import UpgradeNotification from '../../../../../generic/upgrade-notification/UpgradeNotification';

import messages from '../../../messages';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import NotificationTrigger, { ID } from './NotificationTrigger';

const NotificationTray = ({ intl }) => {
  const {
    courseId,
    onNotificationSeen,
    shouldDisplayFullScreen,
    upgradeNotificationCurrentState,
    setUpgradeNotificationCurrentState,
  } = useContext(SidebarContext);
  const course = useModel('coursewareMeta', courseId);

  const {
    accessExpiration,
    contentTypeGatingEnabled,
    marketingUrl,
    offer,
    timeOffsetMillis,
    userTimezone,
  } = course;

  const {
    org,
    verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  // After three seconds, update notificationSeen (to hide red dot)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTimeout(onNotificationSeen, 3000); }, []);

  return (
    <SidebarBase
      title={intl.formatMessage(messages.notificationTitle)}
      ariaLabel={intl.formatMessage(messages.notificationTray)}
      sidebarId={ID}
      className={classNames({ 'h-100': !verifiedMode && !shouldDisplayFullScreen })}
    >
      <div>{verifiedMode
        ? (
          <UpgradeNotification
            offer={offer}
            verifiedMode={verifiedMode}
            accessExpiration={accessExpiration}
            contentTypeGatingEnabled={contentTypeGatingEnabled}
            marketingUrl={marketingUrl}
            upsellPageName="in_course"
            userTimezone={userTimezone}
            shouldDisplayBorder={false}
            timeOffsetMillis={timeOffsetMillis}
            courseId={courseId}
            org={org}
            upgradeNotificationCurrentState={upgradeNotificationCurrentState}
            setupgradeNotificationCurrentState={setUpgradeNotificationCurrentState}
          />
        ) : (
          <UpgradeNotification
            offer="test"
            verifiedMode="test"
            accessExpiration="test"
            contentTypeGatingEnabled="test"
            marketingUrl="test"
            upsellPageName="in_course"
            userTimezone="test"
            shouldDisplayBorder={false}
            timeOffsetMillis="test"
            courseId={courseId}
            org="test"
            upgradeNotificationCurrentState={upgradeNotificationCurrentState}
            setupgradeNotificationCurrentState={setUpgradeNotificationCurrentState}
          />
        )}
      </div>
    </SidebarBase>
  );
};

NotificationTray.propTypes = {
  intl: intlShape.isRequired,
};

NotificationTray.Trigger = NotificationTrigger;
NotificationTray.ID = ID;

export default injectIntl(NotificationTray);
