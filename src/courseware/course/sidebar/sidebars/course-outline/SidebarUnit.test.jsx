import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SidebarUnit from './SidebarUnit';

const unit = {
  complete: false,
  icon: 'video',
  id: 'unit1',
  title: 'Unit 1',
  type: 'video',
};

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <MemoryRouter>
      <SidebarUnit
        isFirst
        id="unit1"
        courseId="course123"
        sequenceId="sequence123"
        unit={unit}
        isActive={false}
        {...props}
      />
    </MemoryRouter>
  </IntlProvider>
);

describe('<SidebarUnit />', () => {
  it('renders correctly when unit is incomplete', () => {
    const {
      getByText,
      container,
    } = render(<RootWrapper />);

    expect(getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is complete', () => {
    const {
      getByText,
      container,
    } = render(<RootWrapper unit={{ ...unit, complete: true }} />);

    expect(getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();
    expect(container.querySelector('.border-top')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is not first', () => {
    const {
      getByText,
      container,
    } = render(<RootWrapper isFirst={false} />);

    expect(getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.border-top')).toBeInTheDocument();
  });
});
