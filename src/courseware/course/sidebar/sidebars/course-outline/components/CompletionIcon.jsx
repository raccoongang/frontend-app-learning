import PropTypes from 'prop-types';
import { CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';

import { CompletionSolidIcon, DashedCircleIcon } from '../icons';

const CompletionIcon = ({ completionStat }) => {
  const { completed, total } = completionStat ?? {};
  const percentage = (completed / total) * 100;
  const remainder = 100 - percentage;

  switch (true) {
    case !completed:
      return <CompletionSolidIcon data-testid="completion-solid-icon" />;
    case completed === total:
      return <CheckCircleIcon className="text-success" data-testid="check-circle-icon" />;
    default:
      return <DashedCircleIcon percentage={percentage} remainder={remainder} data-testid="dashed-circle-icon" />;
  }
};

CompletionIcon.propTypes = {
  completionStat: PropTypes.shape({
    completed: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
};

export default CompletionIcon;
