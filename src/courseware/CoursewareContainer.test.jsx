import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { waitForElementToBeRemoved, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Route, Switch } from 'react-router';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { UserMessagesProvider } from '../generic/user-messages';
import tabMessages from '../tab-page/messages';
import { initializeMockApp } from '../setupTest';

import CoursewareContainer from './CoursewareContainer';
import { buildSimpleCourseBlocks, buildBinaryCourseBlocks } from '../shared/data/__factories__/courseBlocks.factory';
import initializeStore from '../store';
import { appendBrowserTimezoneToUrl } from '../utils';

// NOTE: Because the unit creates an iframe, we choose to mock it out as its rendering isn't
// pertinent to this test.  Instead, we render a simple div that displays the properties we expect
// to have been passed into the component.  Separate tests can handle unit rendering, but this
// proves that the component is rendered and receives the correct props.  We probably COULD render
// Unit.jsx and its iframe in this test, but it's already complex enough.
function MockUnit({ courseId, id }) { // eslint-disable-line react/prop-types
  return (
    <div className="fake-unit">Unit Contents {courseId} {id}</div>
  );
}

jest.mock(
  './course/sequence/Unit',
  () => MockUnit,
);

jest.mock('@edx/frontend-platform/analytics');

initializeMockApp();

describe('CoursewareContainer', () => {
  let store;
  let component;
  let axiosMock;

  // This is a standard set of data that can be used in CoursewareContainer tests.
  // By default, `setUpMockRequests()` will configure the mock LMS API to return use this data.
  // Certain test cases override these in order to test with special blocks/metadata.
  const defaultCourseMetadata = Factory.build('courseMetadata');
  const defaultCourseId = defaultCourseMetadata.id;
  const defaultUnitBlocks = [
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
  ];
  const {
    courseBlocks: defaultCourseBlocks,
    sequenceBlocks: [defaultSequenceBlock],
  } = buildSimpleCourseBlocks(
    defaultCourseId,
    defaultCourseMetadata.name,
    { unitBlocks: defaultUnitBlocks },
  );

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    store = initializeStore();

    component = (
      <AppProvider store={store}>
        <UserMessagesProvider>
          <Switch>
            <Route
              path={[
                '/course/:courseId/:sequenceId/:unitId',
                '/course/:courseId/:sequenceId',
                '/course/:courseId',
              ]}
              component={CoursewareContainer}
            />
          </Switch>
        </UserMessagesProvider>
      </AppProvider>
    );
  });

  function setUpMockRequests(options = {}) {
    // If we weren't given course blocks or metadata, use the defaults.
    const courseBlocks = options.courseBlocks || defaultCourseBlocks;
    const courseMetadata = options.courseMetadata || defaultCourseMetadata;
    const courseId = courseMetadata.id;
    // If we weren't given a list of sequence metadatas for URL mocking,
    // then construct it ourselves by looking at courseBlocks.
    const sequenceMetadatas = options.sequenceMetadatas || (
      Object.values(courseBlocks.blocks)
        .filter(block => block.type === 'sequential')
        .map(sequenceBlock => Factory.build(
          'sequenceMetadata',
          {},
          {
            courseId,
            sequenceBlock,
            unitBlocks: sequenceBlock.children.map(unitId => courseBlocks.blocks[unitId]),
          },
        ))
    );

    const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
    axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);

    const courseMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);

    sequenceMetadatas.forEach(sequenceMetadata => {
      const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
      axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);
    });
  }

  async function waitForSpinnerToBeRemoved() {
    // This async utility function waits for the page spinner to be removed,
    // such that we can wait for our main content to load before making more assertions.
    await waitForElementToBeRemoved(screen.getByRole('status'));
  }

  it('should initialize to show a spinner', () => {
    history.push('/course/abc123');
    render(component);

    const spinner = screen.getByRole('status');

    expect(spinner.firstChild).toContainHTML(
      `<span class="sr-only">${tabMessages.loading.defaultMessage}</span>`,
    );
  });

  describe('when receiving successful course data', () => {
    const courseMetadata = defaultCourseMetadata;
    const courseId = defaultCourseId;

    function assertLoadedHeader(container) {
      const courseHeader = container.querySelector('.course-header');
      // Ensure the course number and org appear - this proves we loaded course metadata properly.
      expect(courseHeader).toHaveTextContent(courseMetadata.number);
      expect(courseHeader).toHaveTextContent(courseMetadata.org);
      // Ensure the course title is showing up in the header.  This means we loaded course blocks properly.
      expect(courseHeader.querySelector('.course-title')).toHaveTextContent(courseMetadata.name);
    }

    function assertSequenceNavigation(container, expectedUnitCount = 3) {
      // Ensure we had appropriate sequence navigation buttons.  We should only have one unit.
      const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation button');
      expect(sequenceNavButtons).toHaveLength(expectedUnitCount + 2);

      expect(sequenceNavButtons[0]).toHaveTextContent('Previous');
      // Prove this button is rendering an SVG tasks icon, meaning it's a unit/vertical.
      expect(sequenceNavButtons[1].querySelector('svg')).toHaveClass('fa-tasks');
      expect(sequenceNavButtons[sequenceNavButtons.length - 1]).toHaveTextContent('Next');
    }

    beforeEach(async () => {
      // On page load, SequenceContext attempts to scroll to the top of the page.
      global.scrollTo = jest.fn();
      setUpMockRequests();
    });

    describe('when the URL only contains a course ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should use the resume block repsonse to pick a unit if it ldcontains one', async () => {
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {
          sectionId: sequenceBlock.id,
          unitId: unitBlocks[1].id,
        });

        history.push(`/course/${courseId}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[1].id);
      });

      it('should use the first sequence ID and activeUnitIndex if the resume block response is empty', async () => {
        // set the position to the third unit so we can prove activeUnitIndex is working
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });

        // Note how there is no sectionId/unitId returned in this mock response!
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {});

        history.push(`/course/${courseId}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the URL contains a section ID instead of a sequence ID', () => {
      const { courseBlocks, unitTree, sequenceTree } = buildBinaryCourseBlocks(courseId, courseMetadata.name);

      beforeEach(async () => {
        setUpMockRequests({ courseBlocks });
        // The active unit will always be the second unit in the first seq of the first section.
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {
          sectionId: sequenceTree[0][0].id,
          unitId: unitTree[0][0][1].id,
        });
      });

      describe('when the URL contains a unit ID within the section', () => {
        it('should replace the section ID in favor of the unit\'s sequence ID', async () => {

        });
      });

      describe('when the URL contains a unit ID *not* within the (non-empty) section', () => {
        it('should choose the active unit within the section\'s first sequence', async () => {

        });
      });

      describe('when the URL contains *no* unit ID, and the section is non-empty', () => {
        it('should choose the active unit within the section\'s first sequence', async () => {

        });
      });

      describe('when the section is empty', () => {
        it('should choose the active unit within the section\'s first sequence', async () => {

        });
      });
    });

    describe('when the URL only contains a unit ID', () => {
      const { courseBlocks, unitTree, sequenceTree } = buildBinaryCourseBlocks(courseId, courseMetadata.name);

      beforeEach(async () => {
        setUpMockRequests({ courseBlocks });
      });

      it('should insert the sequence ID into the URL', async () => {
        const unitBlock = unitTree[1][0][1];
        history.push(`/course/${courseId}/${unitBlock.id}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container, 2);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlock.id);
        const expectedSequenceBlock = sequenceTree[1][0];
        const expectedUrl = `http://localhost/course/${courseId}/${expectedSequenceBlock.id}/${unitBlock.id}`;
        expect(global.location.href).toEqual(expectedUrl);
      });
    });

    describe('when the URL contains a course ID and sequence ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should pick the first unit if position was not defined (activeUnitIndex becomes 0)', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[0].id);
      });

      it('should use activeUnitIndex to pick a unit from the sequence', async () => {
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });

        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the URL contains a course, sequence, and unit ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should load the specified unit', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        const { container } = render(component);
        await waitForSpinnerToBeRemoved();

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });

      it('should navigate between units and check block completion', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        const { container } = render(component);

        axiosMock.onPost(`${courseId}/xblock/${sequenceBlock.id}/handler/xmodule_handler/get_completion`).reply(200, {
          complete: true,
        });
        await waitForSpinnerToBeRemoved();

        const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation button');
        const sequenceNextButton = sequenceNavButtons[4];
        expect(sequenceNextButton).toHaveTextContent('Next');
        fireEvent.click(sequenceNavButtons[4]);

        expect(global.location.href).toEqual(`http://localhost/course/${courseId}/${sequenceBlock.id}/${unitBlocks[1].id}`);
      });
    });

    describe('when the current sequence is an exam', () => {
      const { location } = window;
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      beforeEach(() => {
        delete window.location;
        window.location = {
          assign: jest.fn(),
        };
      });

      afterEach(() => {
        window.location = location;
      });

      it('should redirect to the sequence lmsWebUrl', async () => {
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { is_time_limited: true }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });

        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        render(component);
        await waitForSpinnerToBeRemoved();

        expect(global.location.assign).toHaveBeenCalledWith(sequenceBlock.lms_web_url);
      });
    });
  });

  describe('when receiving a can_load_courseware error_code', () => {
    function setUpWithDeniedStatus(errorCode) {
      const courseMetadata = Factory.build('courseMetadata', {
        can_load_courseware: {
          has_access: false,
          error_code: errorCode,
          additional_context_user_message: 'uhoh oh no', // only used by audit_expired
        },
      });
      const courseId = courseMetadata.id;
      const { courseBlocks } = buildSimpleCourseBlocks(courseId, courseMetadata.name);
      setUpMockRequests({ courseBlocks, courseMetadata });
      history.push(`/course/${courseId}`);
      return courseMetadata;
    }

    it('should go to course home for an enrollment_required error code', async () => {
      const courseMetadata = setUpWithDeniedStatus('enrollment_required');

      render(component);
      await waitForSpinnerToBeRemoved();

      expect(global.location.href).toEqual(`http://localhost/redirect/course-home/${courseMetadata.id}`);
    });

    it('should go to course home for an authentication_required error code', async () => {
      const courseMetadata = setUpWithDeniedStatus('authentication_required');

      render(component);
      await waitForSpinnerToBeRemoved();

      expect(global.location.href).toEqual(`http://localhost/redirect/course-home/${courseMetadata.id}`);
    });

    it('should go to dashboard for an unfulfilled_milestones error code', async () => {
      setUpWithDeniedStatus('unfulfilled_milestones');

      render(component);
      await waitForSpinnerToBeRemoved();

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard');
    });

    it('should go to the dashboard with an attached access_response_error for an audit_expired error code', async () => {
      setUpWithDeniedStatus('audit_expired');

      render(component);
      await waitForSpinnerToBeRemoved();

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard?access_response_error=uhoh%20oh%20no');
    });

    it('should go to the dashboard with a notlive start date for a course_not_started error code', async () => {
      setUpWithDeniedStatus('course_not_started');

      render(component);
      await waitForSpinnerToBeRemoved();

      const startDate = '2/5/2013'; // This date is based on our courseMetadata factory's sample data.
      expect(global.location.href).toEqual(`http://localhost/redirect/dashboard?notlive=${startDate}`);
    });
  });
});
