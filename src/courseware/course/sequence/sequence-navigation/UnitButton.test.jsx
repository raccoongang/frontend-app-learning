import React from 'react';
import { Factory } from 'rosie';
import userEvent from '@testing-library/user-event';
import {
  fireEvent, initializeTestStore, render, screen, waitFor, act,
} from '../../../../setupTest';

import UnitButton from './UnitButton';

describe('Unit Button', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build(
    'block',
    { type: 'problem' },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'video', complete: true },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'other', complete: true, bookmarked: true },
    { courseId: courseMetadata.id },
  )];
  const [unit, completedUnit, bookmarkedUnit] = unitBlocks;

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
    mockData = {
      unitId: unit.id,
      onClick: () => {},
      unitIndex: courseMetadata.id,
    };
  });

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />);
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent(unit.display_name);
  });

  it('check button attributes', () => {
    render(<UnitButton {...mockData} showTitle />);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', `${unit.display_name}-${courseMetadata.id}`);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-controls', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '-1');
  });

  it('button with isActive prop has tabindex 0', () => {
    render(<UnitButton {...mockData} isActive />);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  });

  it('does not show completion for non-completed unit', () => {
    const { container } = render(<UnitButton {...mockData} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('shows completion for completed unit', () => {
    const { container } = render(<UnitButton {...mockData} unitId={completedUnit.id} />);
    const buttonIcons = container.querySelectorAll('.pgn__icon');
    expect(buttonIcons).toHaveLength(2);
    expect(buttonIcons[1]).toHaveTextContent('Checkmark');
  });

  it('hides completion', () => {
    const { container } = render(<UnitButton {...mockData} unitId={completedUnit.id} showCompletion={false} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('does not show bookmark', () => {
    const { container } = render(<UnitButton {...mockData} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-bookmark');
    });
  });

  it('shows bookmark', () => {
    const { container } = render(<UnitButton {...mockData} unitId={bookmarkedUnit.id} />);
    const buttonIcons = container.querySelectorAll('.pgn__icon');
    expect(buttonIcons).toHaveLength(3);
    expect(buttonIcons[2]).toHaveTextContent('Bookmark');
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />);
    fireEvent.click(screen.getByRole('tabpanel'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('focuses bookmark-button after pressing Enter or Space', async () => {
    jest.useFakeTimers();

    const { container } = render(
      <>
        <UnitButton {...mockData} />
        <button id="bookmark-button" type="button">Bookmark</button>
      </>,
    );

    const bookmarkButton = container.querySelector('#bookmark-button');
    bookmarkButton.focus();

    jest.advanceTimersByTime(200);

    await act(async () => {
      await userEvent.keyboard('{Enter}');
    });

    await waitFor(() => {
      expect(document.activeElement.id).toBe('bookmark-button');
    });

    bookmarkButton.focus();

    await act(async () => {
      await userEvent.keyboard('{Space}');
    });

    await waitFor(() => {
      expect(document.activeElement.id).toBe('bookmark-button');
    });

    jest.useRealTimers();
  });

  it('not focuses bookmark-button after pressing other keys', async () => {
    jest.useFakeTimers();

    const { getByRole } = render(
      <>
        <UnitButton {...mockData} />
        <button id="bookmark-button" type="button">Bookmark</button>
      </>,
    );

    jest.advanceTimersByTime(200);

    await userEvent.keyboard('{A}');

    await waitFor(() => {
      expect(getByRole('button', { name: 'Bookmark' })).not.toHaveFocus();
    });
  });
});
