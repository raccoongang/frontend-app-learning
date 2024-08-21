import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useCallback, useContext, useEffect, useRef,
} from 'react';
import { useEventListener } from '../../../../generic/hooks';
import messages from '../../messages';
import SidebarContext from '../SidebarContext';
import { setSessionStorage, getSessionStorage } from '../../../../data/sessionStorage';

const SidebarBase = ({
  intl,
  title,
  ariaLabel,
  sidebarId,
  className,
  children,
  showTitleBar,
  width,
}) => {
  const {
    courseId,
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);
  const closeBtnRef = useRef(null);
  const responsiveCloseNotificationTrayRef = useRef(null);
  const isOpenNotificationTray = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';
  const isFocusedNotificationTray = getSessionStorage(`notificationTrayFocus.${courseId}`) === 'true';

  useEffect(() => {
    if (isOpenNotificationTray && isFocusedNotificationTray && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    if (shouldDisplayFullScreen) {
      responsiveCloseNotificationTrayRef.current?.focus();
    }
  });

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(null);
    }
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  const focusSidebarTriggerBtn = () => {
    const performFocus = () => {
      const sidebarTriggerBtn = document.querySelector('.sidebar-trigger-btn');
      if (sidebarTriggerBtn) {
        sidebarTriggerBtn.focus();
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(performFocus);
    });
  };

  const handleCloseNotificationTray = () => {
    toggleSidebar(null);
    setSessionStorage(`notificationTrayFocus.${courseId}`, 'true');
    setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    focusSidebarTriggerBtn();
  };

  const handleKeyDown = useCallback((event) => {
    const { key, shiftKey, target } = event;

    // Shift + Tab
    if (shiftKey && key === 'Tab' && target === closeBtnRef.current) {
      event.preventDefault();
      focusSidebarTriggerBtn();
    }
  }, [focusSidebarTriggerBtn, closeBtnRef]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleKeyDownNotificationTray = (event) => {
    const { key, shiftKey } = event;
    const currentElement = event.target === responsiveCloseNotificationTrayRef.current;
    const sidebarTriggerBtn = document.querySelector('.call-to-action-btn');

    switch (key) {
      case 'Enter':
        if (currentElement) {
          handleCloseNotificationTray();
        }
        break;

      case 'Tab':
        if (!shiftKey && sidebarTriggerBtn) {
          event.preventDefault();
          sidebarTriggerBtn.focus();
        } else if (shiftKey) {
          event.preventDefault();
          responsiveCloseNotificationTrayRef.current?.focus();
        }
        break;

      default:
        break;
    }
  };

  return (
    <section
      className={classNames('ml-0 ml-lg-4 border border-light-400 rounded-sm h-auto align-top', {
        'bg-white m-0 border-0 fixed-top vh-100 rounded-0': shouldDisplayFullScreen,
        'min-vh-100': !shouldDisplayFullScreen,
        'd-none': currentSidebar !== sidebarId,
      }, className)}
      data-testid={`sidebar-${sidebarId}`}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
    >
      {shouldDisplayFullScreen ? (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={handleCloseNotificationTray}
          onKeyDown={handleKeyDownNotificationTray}
          role="button"
          ref={responsiveCloseNotificationTrayRef}
          tabIndex="0"
          alt={intl.formatMessage(messages.responsiveCloseNotificationTray)}
        >
          <Icon src={ArrowBackIos} />
          <span className="font-weight-bold m-2 d-inline-block">
            {intl.formatMessage(messages.responsiveCloseNotificationTray)}
          </span>
        </div>
      ) : null}
      {showTitleBar && (
        <>
          <div className="d-flex align-items-center">
            <h2 className="sidebar-base-title p-2.5 d-inline-block m-0 text-gray-700">{title}</h2>
            {shouldDisplayFullScreen
              ? null
              : (
                <div className="d-inline-flex mr-2 mt-1.5 ml-auto">
                  <IconButton
                    className="sidebar-close-btn"
                    src={Close}
                    size="sm"
                    ref={closeBtnRef}
                    iconAs={Icon}
                    onClick={handleCloseNotificationTray}
                    alt={intl.formatMessage(messages.closeNotificationTrigger)}
                  />
                </div>
              )}
          </div>
          <div className="py-1 bg-gray-100 border-top border-bottom border-light-400" />
        </>
      )}
      {children}
    </section>
  );
};

SidebarBase.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  sidebarId: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  showTitleBar: PropTypes.bool,
  width: PropTypes.string,
};

SidebarBase.defaultProps = {
  width: '31rem',
  showTitleBar: true,
  className: '',
};

export default injectIntl(SidebarBase);
