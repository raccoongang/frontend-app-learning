import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { checkBlockCompletion } from '../../../../data';
import UnitIcon from './UnitIcon';
import messages from './messages';

const SidebarUnit = ({
  id,
  intl,
  courseId,
  sequenceId,
  isFirst,
  unit,
  isActive,
  activeUnitId,
}) => {
  const {
    complete,
    title,
    icon,
  } = unit;
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(checkBlockCompletion(courseId, sequenceId, activeUnitId));
  };

  return (
    <li className={classNames({ 'bg-info-100': isActive, 'border-top border-light': !isFirst })}>
      <div className="row w-100 m-0 d-flex align-items-center">
        <div className="col-auto p-0">
          <UnitIcon type={icon} isCompleted={complete} />
        </div>
        <div className="col-10 p-0 ml-3 text-break">
          <span className="align-middle">
            <Link
              to={`/course/${courseId}/${sequenceId}/${id}`}
              className="text-gray-700"
              onClick={handleClick}
            >
              {title}
            </Link>
          </span>
          <span className="sr-only">
            , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
          </span>
        </div>
      </div>
    </li>
  );
};

SidebarUnit.propTypes = {
  intl: intlShape.isRequired,
  id: PropTypes.string.isRequired,
  isFirst: PropTypes.bool.isRequired,
  unit: PropTypes.shape({
    complete: PropTypes.bool,
    icon: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  activeUnitId: PropTypes.string.isRequired,
};

SidebarUnit.defaultProps = {
  isActive: false,
};

export default injectIntl(SidebarUnit);
