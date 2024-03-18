import { render } from '@testing-library/react';

import UnitIcon, { UNIT_ICON_TYPES } from './UnitIcon';

describe('<UnitIcon />', () => {
  it('renders default icon correctly', () => {
    const { container } = render(<UnitIcon type={UNIT_ICON_TYPES.video} isCompleted={false} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveClass('text-success');
  });

  it('renders completed icon correctly', () => {
    const { container } = render(<UnitIcon type={UNIT_ICON_TYPES.video} isCompleted />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-success');
  });
});
