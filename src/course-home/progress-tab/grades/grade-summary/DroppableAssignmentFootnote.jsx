import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';

function DroppableAssignmentFootnote({ footnotes, marker, intl }) {
  return (
    <>
      <span id="grade-summary-footnote-label" className="sr-only">{intl.formatMessage(messages.footnotesTitle)}</span>
      <ul className="list-unstyled mt-2">
        {footnotes.map((footnote, index) => (
          <li id={`${footnote.id}-footnote`} key={footnote.id} className="x-small mt-1">
            <FormattedMessage
              id="progress.footnotes.droppableAssignments"
              defaultMessage="{footnoteMarker} The lowest {numDroppable} {assignmentType} {score} will be dropped."
              values={{
                footnoteMarker: marker.repeat(index + 1),
                numDroppable: footnote.numDroppable,
                assignmentType: footnote.assignmentType,
                score: footnote.numDroppable > 1 ? 'scores' : 'score',
              }}
            />
            <a className="sr-only" href={`#${footnote.id}-ref`}>{intl.formatMessage(messages.backToContent)}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

DroppableAssignmentFootnote.propTypes = {
  footnotes: PropTypes.arrayOf(PropTypes.shape({
    assignmentType: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    numDroppable: PropTypes.number.isRequired,
  })).isRequired,
  marker: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DroppableAssignmentFootnote);
