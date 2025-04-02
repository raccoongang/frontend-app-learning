import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import ChatWindow from './ChatWindow';

import messages from './messages';
import './MentoringTab.scss';

const MentoringTab = ({ intl }) => (
  <div className="mx-auto mb-5 course-mentoring-tab">
    <h2 aria-level="1" className="h2 my-3">
      {intl.formatMessage(messages.title)}
    </h2>

    <ChatWindow />
  </div>
);

MentoringTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MentoringTab);
