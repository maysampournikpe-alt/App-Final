/** Search links only. We never guess at a specific video address; the student picks a video from the results. */
export const youtubeSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const khanSearch = (q: string) => `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(q)}`;

/** "AP Biology Structure of Water and Hydrogen Bonding". Course names already start with AP, and test names are kept as they are. */
export const lessonQuery = (course: string, lesson: string) => `${course} ${lesson}`.replace(/\s+/g, " ").trim();
