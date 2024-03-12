import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Locked as LockedIcon,
  Article as ArticleIcon,
} from '@openedx/paragon/icons';

import {
  BookCompleteIcon,
  BookIcon,
  EditSquareCompleteIcon,
  EditSquareIcon,
  VideocamCompleteIcon,
  VideocamIcon,
} from './icons';

const UnitIcon = ({ type, isCompleted, ...props }) => {
  let Icon;
  switch (type) {
    case 'video':
      Icon = isCompleted ? VideocamCompleteIcon : VideocamIcon;
      break;
    case 'problem':
      Icon = isCompleted ? EditSquareCompleteIcon : EditSquareIcon;
      break;
    case 'vertical':
      Icon = ArticleIcon;
      break;
    case 'lock':
      Icon = LockedIcon;
      break;
    default:
      Icon = isCompleted ? BookCompleteIcon : BookIcon;
  }

  return (
    <Icon {...props} className={classNames({ 'text-success': isCompleted, 'text-gray-700': !isCompleted })} />
  );
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem', 'lock']).isRequired,
  isCompleted: PropTypes.bool.isRequired,
};

export default UnitIcon;
