const POSTS_KEY = 'localhub:v1:posts';
const LIKES_KEY = 'localhub:v1:likes'; 
const BOOKMARKS_KEY = 'localhub:v1:bookmarks'; 

export const postService = {
  // --- 1. 기본 게시글 CRUD ---
  
  getAllPosts() {
    const data = localStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  addPost(newPost) {
    const posts = this.getAllPosts();
    posts.unshift(newPost);
    this.savePosts(posts);
  },

  getPostById(id) {
    const posts = this.getAllPosts();
    return posts.find(post => post.id === id) || null;
  },

  updatePost(updatedPost) {
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      posts[index] = updatedPost;
      this.savePosts(posts);
    }
  },

  deletePost(id) {
    let posts = this.getAllPosts();
    posts = posts.filter(p => p.id !== id);
    this.savePosts(posts);
  },

  // --- 2. 좋아요 & 북마크 기능 ---

  getLikes() {
    const data = localStorage.getItem(LIKES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getBookmarks() {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  isLiked(postId) {
    return this.getLikes().includes(postId);
  },

  isBookmarked(postId) {
    return this.getBookmarks().includes(postId);
  },

  toggleLike(postId) {
    let likes = this.getLikes();
    let posts = this.getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return { isLiked: false, likeCount: 0 };

    const isCurrentlyLiked = likes.includes(postId);

    if (isCurrentlyLiked) {
      // 좋아요 취소: 배열에서 ID 제거 및 카운트 감소
      likes = likes.filter(id => id !== postId);
      posts[postIndex].likeCount = Math.max(0, (posts[postIndex].likeCount || 0) - 1);
    } else {
      // 좋아요 추가: 배열에 ID 추가 및 카운트 증가
      likes.push(postId);
      posts[postIndex].likeCount = (posts[postIndex].likeCount || 0) + 1;
    }

    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    this.savePosts(posts); // 변경된 카운트 반영

    return { 
      isLiked: !isCurrentlyLiked, 
      likeCount: posts[postIndex].likeCount 
    };
  },

  toggleBookmark(postId) {
    let bookmarks = this.getBookmarks();
    const isCurrentlyBookmarked = bookmarks.includes(postId);

    if (isCurrentlyBookmarked) {
      // 북마크 취소
      bookmarks = bookmarks.filter(id => id !== postId);
    } else {
      // 북마크 추가
      bookmarks.push(postId);
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return !isCurrentlyBookmarked;
  }
};