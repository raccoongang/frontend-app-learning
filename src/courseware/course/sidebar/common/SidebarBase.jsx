import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect } from 'react';
import { useEventListener } from '../../../../generic/hooks';
import messages from '../../messages';
import SidebarContext from '../SidebarContext';
import { setSessionStorage } from '../../../../data/sessionStorage';

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

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(null);
    }
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  const handleNotificationClose = () => {
    toggleSidebar(null);
    setSessionStorage(`notificationTrayFocus.${courseId}`, 'true');
    setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
  };

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      handleNotificationClose();
    }
  }, [handleNotificationClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
          onClick={() => toggleSidebar(null)}
          onKeyDown={() => toggleSidebar(null)}
          role="button"
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
            <h2
              className="p-2.5 d-inline-block"
              style={{
                fontSize: '1.125rem', fontWeight: '400', color: '#454545', margin: '0', lineHeight: '1.5556',
              }}
            >{title}
            </h2>
            {shouldDisplayFullScreen
              ? null
              : (
                <div className="d-inline-flex mr-2 mt-1.5 ml-auto">
                  <IconButton
                    src={Close}
                    size="sm"
                    iconAs={Icon}
                    onClick={handleNotificationClose}
                    alt={intl.formatMessage(messages.closeNotificationTrigger)}
                  />123
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
