export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds = [] } = state.models.coursewareMeta[state.courseware.courseId];

  return sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);
}

export const getSequenceId = state => state.courseware.sequenceId;

export const getCourseStatus = state => state.courseHome;
