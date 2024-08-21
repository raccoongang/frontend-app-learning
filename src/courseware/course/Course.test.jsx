import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { breakpoints } from '@edx/paragon';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  act, fireEvent, initializeTestStore, loadUnit, render, screen, waitFor, getByRole,
} from '../../setupTest';
import { buildTopicsFromUnits } from '../data/__factories__/discussionTopics.factory';
import { handleNextSectionCelebration } from './celebration';
import * as celebrationUtils from './celebration/utils';
import Course from './Course';
import { executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import messages from './messages';

jest.mock('@edx/frontend-platform/analytics');

const recordFirstSectionCelebration = jest.fn();
// eslint-disable-next-line no-import-assign
celebrationUtils.recordFirstSectionCelebration = recordFirstSectionCelebration;

describe('Course', () => {
  let store;
  let getItemSpy;
  let setItemSpy;
  const mockData = {
    nextSequenceHandler: () => {},
    previousSequenceHandler: () => {},
    unitNavigationHandler: () => {},
  };

  beforeAll(async () => {
    store = await initializeTestStore();
    const { courseware, models } = store.getState();
    const { courseId, sequenceId } = courseware;
    Object.assign(mockData, {
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    });
    getItemSpy = jest.spyOn(Object.getPrototypeOf(window.sessionStorage), 'getItem');
    setItemSpy = jest.spyOn(Object.getPrototypeOf(window.sessionStorage), 'setItem');
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  afterAll(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  const setupDiscussionSidebar = async (storageValue = false) => {
    localStorage.clear();
    const testStore = await initializeTestStore({ provider: 'openedx' });
    const state = testStore.getState();
    const { courseware: { courseId } } = state;
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(200, { provider: 'openedx' });
    const topicsResponse = buildTopicsFromUnits(state.models.units);
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
      .reply(200, topicsResponse);

    await executeThunk(thunks.getCourseDiscussionTopics(courseId), testStore.dispatch);
    const [firstUnitId] = Object.keys(state.models.units);
    mockData.unitId = firstUnitId;
    const [firstSequenceId] = Object.keys(state.models.sequences);
    mockData.sequenceId = firstSequenceId;
    if (storageValue !== null) {
      localStorage.setItem('showDiscussionSidebar', storageValue);
    }
    await render(<Course {...mockData} />, { store: testStore });
  };

  it('loads learning sequence', async () => {
    render(<Course {...mockData} />);
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Learn About Verified Certificates' })).not.toBeInTheDocument();

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    const { models } = store.getState();
    const sequence = models.sequences[mockData.sequenceId];
    const section = models.sections[sequence.sectionId];
    const course = models.coursewareMeta[mockData.courseId];
    expect(document.title).toMatch(
      `${sequence.title} | ${section.title} | ${course.title} | edX`,
    );
  });

  it('displays first section celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { firstSection: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    // Set up LocalStorage for testing.
    handleNextSectionCelebration(sequenceId, sequenceId, testData.unitId);
    render(<Course {...testData} />, { store: testStore });

    const firstSectionCelebrationModal = screen.getByRole('dialog');
    expect(firstSectionCelebrationModal).toBeInTheDocument();
    expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
  });

  it('displays weekly goal celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { weeklyGoal: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    render(<Course {...testData} />, { store: testStore });

    const weeklyGoalCelebrationModal = screen.getByRole('dialog');
    expect(weeklyGoalCelebrationModal).toBeInTheDocument();
    expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
  });

  it('displays notification trigger and toggles active class on click', async () => {
    localStorage.setItem('showDiscussionSidebar', false);
    render(<Course {...mockData} />);

    const notificationTrigger = screen.getByRole('button', { name: messages.openNotificationTrigger.defaultMessage });
    expect(notificationTrigger).toBeInTheDocument();
    expect(notificationTrigger.parentNode).toHaveClass('border-primary-700');
    fireEvent.click(notificationTrigger);
    expect(notificationTrigger.parentNode).not.toHaveClass('border-primary-700');
  });

  it('handles toggling the notification tray and manages focus correctly', async () => {
    const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@bcdabcdabcdabcdabcdabcdabcdabcd3';
    sessionStorage.clear();
    localStorage.setItem('showDiscussionSidebar', false);
    render(<Course {...mockData} />);

    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    expect(sessionStorage.getItem(`notificationTrayFocus.${mockData.courseId}`)).toBe('"false"');
    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });
    expect(screen.queryByRole('region', { name: /notification tray/i })).not.toHaveClass('d-none');
    expect(notificationShowButton).toHaveAttribute('aria-expanded', 'true');
    expect(notificationShowButton).toHaveAttribute('aria-controls', sectionId);
    const notificationTrayCloseBtn = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    expect(notificationTrayCloseBtn).not.toHaveFocus();

    fireEvent.click(notificationShowButton);

    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    expect(sessionStorage.getItem(`notificationTrayFocus.${mockData.courseId}`)).toBe('"false"');
    expect(notificationShowButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: /notification tray/i })).toHaveClass('d-none');
    expect(notificationTrayCloseBtn).not.toHaveFocus();

    fireEvent.click(notificationShowButton);
    expect(notificationTrayCloseBtn).toHaveFocus();
    expect(sessionStorage.getItem(`notificationTrayFocus.${mockData.courseId}`)).toBe('"true"');
    expect(notificationShowButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close the notification tray and move focus to the show button after clicking the show button', async () => {
    sessionStorage.clear();
    localStorage.setItem('showDiscussionSidebar', false);
    render(<Course {...mockData} />);

    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });

    const notificationTrayCloseBtn = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    fireEvent.click(notificationTrayCloseBtn);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    expect(notificationTrayCloseBtn).toHaveFocus();
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');

    await waitFor(() => {
      expect(notificationShowButton).toHaveFocus();
    });
  });

  it('should navigate focus between the notification tray close and show buttons using Shift+Tab and Tab', async () => {
    sessionStorage.clear();
    localStorage.setItem('showDiscussionSidebar', false);
    render(<Course {...mockData} />);

    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });

    const notificationTrayCloseBtn = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    fireEvent.click(notificationTrayCloseBtn);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    expect(notificationTrayCloseBtn).toHaveFocus();
    fireEvent.keyDown(document.activeElement, {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      charCode: 9,
      shiftKey: true,
    });

    await waitFor(() => {
      expect(notificationShowButton).toHaveFocus();
    });

    fireEvent.keyDown(document.activeElement, {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      charCode: 9,
    });

    await waitFor(() => {
      expect(notificationTrayCloseBtn).toHaveFocus();
    });
  });

  it('should close the notification tray and move focus to the show button after pressing Enter', async () => {
    sessionStorage.clear();
    localStorage.setItem('showDiscussionSidebar', false);
    render(<Course {...mockData} />);

    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });

    const notificationTrayCloseBtn = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    fireEvent.click(notificationTrayCloseBtn);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    expect(notificationTrayCloseBtn).toHaveFocus();
    fireEvent.keyDown(notificationTrayCloseBtn, {
      key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13,
    });
    await waitFor(() => {
      expect(notificationShowButton).toHaveFocus();
    });
  });

  it('handles reload persisting notification tray status', async () => {
    sessionStorage.clear();
    render(<Course {...mockData} />);
    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');

    // Mock reload window, this doesn't happen in the Course component,
    // calling the reload to check if the tray remains closed
    const { location } = window;
    delete window.location;
    window.location = { reload: jest.fn() };
    window.location.reload();
    expect(window.location.reload).toHaveBeenCalled();
    window.location = location;
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    expect(screen.queryByTestId('NotificationTray')).not.toBeInTheDocument();
  });

  it('handles sessionStorage from a different course for the notification tray', async () => {
    sessionStorage.clear();
    localStorage.setItem('showDiscussionSidebar', false);
    const courseMetadataSecondCourse = Factory.build('courseMetadata', { id: 'second_course' });

    // set sessionStorage for a different course before rendering Course
    sessionStorage.setItem(`notificationTrayStatus.${courseMetadataSecondCourse.id}`, '"open"');

    render(<Course {...mockData} />);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    const notificationShowButton = await screen.findByRole('button', { name: messages.openNotificationTrigger.defaultMessage });
    fireEvent.click(notificationShowButton);

    // Verify sessionStorage was updated for the original course
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');

    // Verify the second course sessionStorage was not changed
    expect(sessionStorage.getItem(`notificationTrayStatus.${courseMetadataSecondCourse.id}`)).toBe('"open"');
  });

  it('renders course breadcrumbs as expected', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
    };
    render(<Course {...testData} />, { store: testStore });

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // expect the section and sequence "titles" to be loaded in as breadcrumb labels.
    expect(screen.getByText(Object.values(models.sections)[0].title)).toBeInTheDocument();
    expect(screen.getByText(Object.values(models.sequences)[0].title)).toBeInTheDocument();
  });

  [
    { value: true, visible: true },
    { value: false, visible: false },
    { value: null, visible: true },
  ].forEach(async ({ value, visible }) => (
    it(`discussion sidebar is ${visible ? 'shown' : 'hidden'} when localstorage value is ${value}`, async () => {
      await setupDiscussionSidebar(value);
      const element = await waitFor(() => screen.findByTestId('sidebar-DISCUSSIONS'));
      if (visible) {
        expect(element).not.toHaveClass('d-none');
      } else {
        expect(element).toHaveClass('d-none');
      }
    })));

  [
    { value: true, result: 'false' },
    { value: false, result: 'true' },
  ].forEach(async ({ value, result }) => (
    it(`Discussion sidebar storage value is ${!value} when sidebar is ${value ? 'closed' : 'open'}`, async () => {
      await setupDiscussionSidebar(value);
      await act(async () => {
        const button = await screen.queryByRole('button', { name: /Show discussions tray/i });
        button.click();
      });
      expect(localStorage.getItem('showDiscussionSidebar')).toBe(result);
    })));

  it('passes handlers to the sequence', async () => {
    const nextSequenceHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const unitNavigationHandler = jest.fn();

    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
      nextSequenceHandler,
      previousSequenceHandler,
      unitNavigationHandler,
    };
    render(<Course {...testData} />, { store: testStore });

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));
    screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

    // We are in the middle of the sequence, so no
    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(nextSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenCalledTimes(2);
  });

  it('navigates through breadcrumb links and focuses on notification and active unit buttons using Tab key', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
    };
    render(<Course {...testData} />, { store: testStore });

    loadUnit();

    const breadcrumb = screen.getByRole('navigation', { name: 'breadcrumb' });
    const listItems = within(breadcrumb).getAllByRole('listitem');
    const links = listItems.map((li) => within(li).getByRole('link'));

    links[0].focus();
    expect(links[0]).toHaveFocus();

    links.slice(1).forEach((link) => {
      userEvent.tab();
      expect(link).toHaveFocus();
    });
    expect(links[links.length - 1]).toHaveFocus();

    userEvent.tab();
    const notificationButton = screen.getByRole('button', { name: messages.openNotificationTrigger.defaultMessage });
    expect(notificationButton).toHaveFocus();

    userEvent.tab();
    const activeUnitButton = screen.getByRole('button', { class: 'active' });
    activeUnitButton.focus();
    expect(activeUnitButton).toHaveFocus();
  });

  describe('Sequence alerts display', () => {
    it('renders banner text alert', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const sequenceBlocks = [Factory.build('block', { type: 'sequential', banner_text: 'Some random banner text to display.' })];
      const sequenceMetadata = [Factory.build(
        'sequenceMetadata',
        { banner_text: sequenceBlocks[0].banner_text },
        { courseId: courseMetadata.id, sequenceBlock: sequenceBlocks[0] },
      )];

      const testStore = await initializeTestStore({ courseMetadata, sequenceBlocks, sequenceMetadata });
      const testData = {
        ...mockData,
        courseId: courseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      render(<Course {...testData} />, { store: testStore });
      await waitFor(() => expect(screen.getByText('Some random banner text to display.')).toBeInTheDocument());
    });

    it('renders Entrance Exam alert with passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const testCourseMetadata = Factory.build('courseMetadata', {
        entrance_exam_data: {
          entrance_exam_current_score: 1.0,
          entrance_exam_enabled: true,
          entrance_exam_id: sectionId,
          entrance_exam_minimum_score_pct: 0.7,
          entrance_exam_passed: true,
        },
      });
      const sequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', sectionId },
        { courseId: testCourseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: testCourseMetadata.id },
      )];

      const testStore = await initializeTestStore({
        courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks,
      });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      render(<Course {...testData} />, { store: testStore });
      await waitFor(() => expect(screen.getByText('Your score is 100%. You have passed the entrance exam.')).toBeInTheDocument());
    });

    it('renders Entrance Exam alert with non-passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const testCourseMetadata = Factory.build('courseMetadata', {
        entrance_exam_data: {
          entrance_exam_current_score: 0.3,
          entrance_exam_enabled: true,
          entrance_exam_id: sectionId,
          entrance_exam_minimum_score_pct: 0.7,
          entrance_exam_passed: false,
        },
      });
      const sequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', sectionId },
        { courseId: testCourseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: testCourseMetadata.id },
      )];

      const testStore = await initializeTestStore({
        courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks,
      });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      render(<Course {...testData} />, { store: testStore });
      await waitFor(() => expect(screen.getByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument());
    });
  });
});
