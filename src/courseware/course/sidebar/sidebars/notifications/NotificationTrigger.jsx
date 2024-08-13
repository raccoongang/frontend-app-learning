// eslint-disable-next-line no-unused-vars
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React, {
  useContext, useEffect, useState, useRef,
} from 'react';
import { getLocalStorage, setLocalStorage } from '../../../../../data/localStorage';
import { getSessionStorage, setSessionStorage } from '../../../../../data/sessionStorage';
import messages from '../../../messages';
import SidebarTriggerBase from '../../common/TriggerBase';
import SidebarContext from '../../SidebarContext';

import NotificationIcon from './NotificationIcon';

export const ID = 'NOTIFICATIONS';

const NotificationTrigger = ({
  intl,
  onClick,
}) => {
  const {
    courseId,
    sectionId,
    notificationStatus,
    setNotificationStatus,
    upgradeNotificationCurrentState,
    toggleSidebar,
    currentSidebar,
  } = useContext(SidebarContext);
  const [isOpenNotificationStatusBar, toggleNotificationStatusBar] = useState(false);
  const sidebarTriggerBtnRef = useRef(null);

  /* Re-show a red dot beside the notification trigger for each of the 7 UpgradeNotification stages
   The upgradeNotificationCurrentState prop will be available after UpgradeNotification mounts. Once available,
  compare with the last state they've seen, and if it's different then set dot back to red */
  function UpdateUpgradeNotificationLastSeen() {
    if (upgradeNotificationCurrentState) {
      if (getLocalStorage(`upgradeNotificationLastSeen.${courseId}`) !== upgradeNotificationCurrentState) {
        setNotificationStatus('active');
        setLocalStorage(`notificationStatus.${courseId}`, 'active');
        setLocalStorage(`upgradeNotificationLastSeen.${courseId}`, upgradeNotificationCurrentState);
      }
    }
  }

  if (!getLocalStorage(`notificationStatus.${courseId}`)) {
    setLocalStorage(`notificationStatus.${courseId}`, 'active'); // Show red dot on notificationTrigger until seen
  }

  if (!getLocalStorage(`upgradeNotificationCurrentState.${courseId}`)) {
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'initialize');
  }

  useEffect(() => {
    UpdateUpgradeNotificationLastSeen();
    if (getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open') {
      toggleNotificationStatusBar(true);
      if (!currentSidebar) {
        toggleSidebar(ID);
        setSessionStorage(`notificationTrayFocus.${courseId}`, 'false');
      }
    } else {
      toggleNotificationStatusBar(false);
    }
  });

  const handleClick = () => {
    setSessionStorage(`notificationTrayFocus.${courseId}`, String(!isOpenNotificationStatusBar));

    if (getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open') {
      toggleNotificationStatusBar(true);
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    } else {
      toggleNotificationStatusBar(false);
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'open');
      sidebarTriggerBtnRef.current?.focus();
    }
    onClick();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      if (getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open') {
        event.preventDefault();
      }
      sidebarTriggerBtnRef.current?.blur();
      const targetButton = document.querySelector('.btn-icon-primary');
      if (targetButton) {
        targetButton.focus();
      }
    }
  };

  return (
    <SidebarTriggerBase
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      ariaLabel={intl.formatMessage(messages.openNotificationTrigger)}
      isOpenNotificationStatusBar={isOpenNotificationStatusBar}
      sectionId={sectionId}
      ref={sidebarTriggerBtnRef}
    >
      <NotificationIcon status={notificationStatus} notificationColor="bg-danger-500" />
    </SidebarTriggerBase>
  );
};

NotificationTrigger.propTypes = {
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(NotificationTrigger);
