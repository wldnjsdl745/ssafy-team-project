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
  }
};