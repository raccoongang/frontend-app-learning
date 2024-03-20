import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { initializeMockApp, initializeTestStore } from '../../../../../setupTest';
import SidebarUnit from './SidebarUnit';

initializeMockApp();

describe('<SidebarUnit />', () => {
  let store = {};
  const unit = {
    complete: false,
    icon: 'video',
    id: 'unit1',
    title: 'Unit 1',
    type: 'video',
  };

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
  };

  function renderWithProvider(props = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
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
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly when unit is incomplete', async () => {
    await initTestStore();
    const container = renderWithProvider();

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is complete', async () => {
    await initTestStore();
    const container = renderWithProvider({ unit: { ...unit, complete: true } });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();
    expect(container.querySelector('.border-top')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is not first', async () => {
    await initTestStore();
    const container = renderWithProvider({ isFirst: false });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.border-top')).toBeInTheDocument();
  });
});
