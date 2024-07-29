import { injectIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';

const SidebarTriggerBase = ({
  onClick,
  ariaLabel,
  children,
  isOpenNotificationStatusBar,
  sectionId,
}) => (
  <button
    className="border border-light-400 bg-transparent align-items-center align-content-center d-flex"
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    aria-expanded={isOpenNotificationStatusBar}
    aria-controls={sectionId}
  >
    <div className="icon-container d-flex position-relative align-items-center">
      {children}
    </div>
  </button>
);

SidebarTriggerBase.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  isOpenNotificationStatusBar: PropTypes.bool.isRequired,
  sectionId: PropTypes.string.isRequired,
};

export default injectIntl(SidebarTriggerBase);
