import React from 'react';
import { Icon } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

const CompleteIcon = (props) => <Icon src={Check} screenReaderText="Checkmark" {...props} />;

export default CompleteIcon;
