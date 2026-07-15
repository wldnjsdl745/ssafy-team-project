// src/services/postService.js
const POSTS_KEY = 'localhub:v1:posts';

export const postService = {
  // 전체 게시글 조회
  getAllPosts() {
    const data = localStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 게시글 저장
  savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  // 신규 게시글 추가 메서드
  addPost(newPost) {
    const posts = this.getAllPosts();
    posts.unshift(newPost); // 유효성 검증 후 posts 앞쪽에 추가
    this.savePosts(posts);
  },
  // 단일 게시글 조회
  getPostById(id) {
    const posts = this.getAllPosts();
    return posts.find(post => post.id === id) || null;
  },

  // 게시글 갱신 (수정 및 조회수 증가용)
  updatePost(updatedPost) {
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      posts[index] = updatedPost;
      this.savePosts(posts);
    }
  },

  // 게시글 삭제
  deletePost(id) {
    let posts = this.getAllPosts();
    posts = posts.filter(p => p.id !== id);
    this.savePosts(posts);
  }
};