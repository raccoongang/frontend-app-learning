import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Button } from '@edx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';
import BookmarkFilledIcon from '../../bookmark/BookmarkFilledIcon';
import { useScrollToContent } from '../../../../generic/hooks';

const UnitButton = ({
  onClick,
  title,
  contentType,
  isActive,
  bookmarked,
  complete,
  showCompletion,
  unitId,
  className,
  showTitle,
  unitIndex,
}) => {
  useScrollToContent(isActive ? `${title}-${unitIndex}` : null);

  const handleClick = useCallback(() => {
    onClick(unitId);
  }, [onClick, unitId]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick(unitId);

      const performFocus = () => {
        const targetElement = document.getElementById('bookmark-button');
        if (targetElement) {
          targetElement.focus();
        }
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(performFocus);
      });
    }
  };

  return (
    <Button
      className={classNames({
        active: isActive,
        complete: showCompletion && complete,
      }, className)}
      variant="link"
      onClick={handleClick}
      title={title}
      role="tabpanel"
      tabIndex={isActive ? 0 : -1}
      aria-controls={title}
      id={`${title}-${unitIndex}`}
      aria-labelledby={title}
      onKeyDown={handleKeyDown}
    >
      <UnitIcon type={contentType} />
      {showTitle && <span className="unit-title">{title}</span>}
      {showCompletion && complete ? <CompleteIcon size="sm" className="text-success ml-2" /> : null}
      {bookmarked ? (
        <BookmarkFilledIcon
          className="unit-filled-bookmark text-primary small position-absolute"
          style={{
            top: '-3px', right: '2px', height: '20px', width: '20px',
          }}
        />
      ) : null}
    </Button>
  );
};

UnitButton.propTypes = {
  bookmarked: PropTypes.bool,
  className: PropTypes.string,
  complete: PropTypes.bool,
  contentType: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool,
  showTitle: PropTypes.bool,
  title: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  unitIndex: PropTypes.number.isRequired,
};

UnitButton.defaultProps = {
  className: undefined,
  isActive: false,
  bookmarked: false,
  complete: false,
  showTitle: false,
  showCompletion: true,
};

const mapStateToProps = (state, props) => {
  if (props.unitId) {
    return {
      ...state.models.units[props.unitId],
    };
  }
  return {};
};

export default connect(mapStateToProps)(UnitButton);
