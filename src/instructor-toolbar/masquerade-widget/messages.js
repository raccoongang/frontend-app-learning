import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  genericError: {
    id: 'masquerade-widget.userName.error.generic',
    defaultMessage: 'An error has occurred; please try again.',
    description: 'Message shown after a general error when attempting to masquerade',
  },
  placeholder: {
    id: 'masquerade-widget.userName.input.placeholder',
    defaultMessage: 'Username or email',
    description: 'Placeholder text to prompt for a user to masquerade as',
  },
  userNameLabel: {
    id: 'masquerade-widget.userName.input.label',
    defaultMessage: 'Masquerade as this user',
    description: 'Label for the masquerade user input',
  },
  viewThisCourseAsLabel: {
    id: 'masquerade-widget.viewThisCourseAs.label',
    defaultMessage: 'View this course as:',
    description: 'Label for masquerade dropdown in the instructor toolbar',
  },
  staffLabel: {
    id: 'masquerade-widget.role.staff',
    defaultMessage: 'Staff',
    description: 'Masquerade dropdown selected label for Staff role',
  },
  learnerLabel: {
    id: 'masquerade-widget.role.learner',
    defaultMessage: 'Learner',
    description: 'Masquerade dropdown selected label for Learner role',
  },
  specificStudentLabel: {
    id: 'masquerade-widget.role.specificStudent',
    defaultMessage: 'Specific Student...',
    description: 'Masquerade dropdown selected label when viewing specific student',
  },
  myCertificateLabel: {
    id: 'masquerade-widget.role.myCertificate',
    defaultMessage: 'My certificate',
    description: 'Masquerade dropdown label for the certificate view option',
  },
  optionsError: {
    id: 'masquerade-widget.options.error',
    defaultMessage: 'Unable to get masquerade options',
    description: 'Error shown when fetching masquerade options fails',
  },
});

export default messages;
