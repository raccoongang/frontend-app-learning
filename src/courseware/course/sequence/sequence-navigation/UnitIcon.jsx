import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@edx/paragon';
import { BookOpen as BookOpenIcon } from '@edx/paragon/icons';

import { UNIT_ICON_TYPES, UNIT_TYPE_ICONS_MAP } from './constants';

const UnitIcon = ({ type }) => {
  const icon = UNIT_TYPE_ICONS_MAP[type] || BookOpenIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(UNIT_ICON_TYPES).isRequired,
};

export default UnitIcon;
