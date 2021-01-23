class Bookmarks {
  constructor() {
    this.bookmarks = [];
  }

  addBookmark(frame, note, camera) {
    this.bookmarks[frame] = { note, camera };
  }

  updateBookmarkNote(frame, note) {
    if (!this.bookmarks[frame]) return;
    this.bookmarks[frame] = { ...this.bookmarks[frame], note };
  }

  updateBookmarkCamera(frame, camera) {
    if (!this.bookmarks[frame]) return;
    this.bookmarks[frame] = { ...this.bookmarks[frame], camera };
  }

  updateBookmark(frame, note, camera) {
    if (!this.bookmarks[frame]) return;
    this.bookmarks[frame] = { note, camera };
  }

  getBookmark(frame) {
    return this.bookmarks[frame];
  }

  getBookmarks() {
    return this.bookmarks;
  }
}

export default Bookmarks;
