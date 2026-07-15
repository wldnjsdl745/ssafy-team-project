<template>
  <div class="community-page">
    <div class="page-header">
      <h2>커뮤니티</h2>
      <!-- 글쓰기 버튼: 클릭 시 모달 열기 -->
      <button @click="openModal" class="btn-primary">글쓰기</button>
    </div>

    <!-- 기존 검색 및 게시글 목록 UI 유지 -->
    <div class="controls">
      <input v-model="searchQuery" @input="resetPage" placeholder="제목, 내용, 태그 검색" />
      <select v-model="sortOrder" @change="resetPage">
        <option value="latest">최신순</option>
        <option value="views">조회수순</option>
      </select>
    </div>

    <!-- 목록 렌더링 영역 (이전과 동일) -->
    <template v-if="paginatedPosts.length > 0">
      <ul class="post-list">
        <li v-for="post in paginatedPosts" :key="post.id" @click="goToDetail(post.id)">
          <h3>{{ post.title }}</h3>
          <p>{{ truncateText(post.content, 50) }}</p>
        </li>
      </ul>
      <div class="pagination">
        <!-- 페이징 버튼 (이전과 동일) -->
      </div>
    </template>
    <template v-else>
      <p>게시글이 없습니다.</p>
    </template>

    <!-- ⭐️ 글쓰기 모달 창 영역 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>새 게시글 작성</h2>
        <div class="warning-box">
          <p>⚠️ 로컬 프로토타입입니다. 비밀번호는 브라우저에 저장됩니다.</p>
        </div>

        <form @submit.prevent="submitPost" class="write-form">
          <div class="form-group">
            <label>제목 <span class="required">*</span></label>
            <input v-model="form.title" type="text" placeholder="2~60자" />
          </div>

          <div class="form-group">
            <label>내용 <span class="required">*</span></label>
            <textarea v-model="form.content" rows="6" placeholder="5~2000자"></textarea>
          </div>

          <div class="form-group">
            <label>비밀번호 <span class="required">*</span></label>
            <input v-model="form.password" type="password" placeholder="영문·숫자 조합 4~12자" />
          </div>

          <div class="form-group">
            <label>태그 (선택)</label>
            <div class="tag-input-wrap">
              <input 
                v-model="tagInput" 
                @keydown.enter.prevent="addTag"
                type="text" 
                placeholder="태그 입력 후 Enter" 
              />
            </div>
            <div class="tag-list" v-if="form.tags.length > 0">
              <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">
                #{{ tag }} <button type="button" @click="removeTag(index)">×</button>
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">취소</button>
            <button type="submit" class="btn-submit">작성 완료</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { postService } from '../services/postService';

const router = useRouter();

// --- 목록 상태 관리 (기존 로직 유지) ---
const posts = ref(postService.getAllPosts() || []);
const searchQuery = ref('');
const sortOrder = ref('latest');
const currentPage = ref(1);
const itemsPerPage = 10;

// (computed 목록 필터링, 페이징 로직은 이전과 완전히 동일하게 유지)
const filteredAndSortedPosts = computed(() => {
  let result = [...posts.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(post => 
      post.title?.toLowerCase().includes(query) || 
      post.content?.toLowerCase().includes(query)
    );
  }
  if (sortOrder.value === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOrder.value === 'views') {
    result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedPosts.value.length / itemsPerPage)));
const paginatedPosts = computed(() => filteredAndSortedPosts.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));
const resetPage = () => { currentPage.value = 1; };
const truncateText = (text, maxLength) => text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
const goToDetail = (id) => { router.push(`/community/${id}`); };


// --- ⭐️ 모달 및 글쓰기 폼 상태 관리 ---
const isModalOpen = ref(false);
const tagInput = ref('');

// 폼 초기 상태 팩토리 함수
const getInitialForm = () => ({
  title: '',
  content: '',
  password: '',
  tags: []
});

const form = reactive(getInitialForm());

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  if (form.title || form.content) {
    if (!confirm('작성을 취소하시겠습니까? 작성 중인 내용은 저장되지 않습니다.')) return;
  }
  isModalOpen.value = false;
  Object.assign(form, getInitialForm()); // 폼 초기화
  tagInput.value = '';
};

const addTag = () => {
  const value = tagInput.value.trim();
  if (!value) return;
  if (form.tags.length >= 5) return alert('태그는 최대 5개까지 입력할 수 있습니다.');
  if (value.length > 10) return alert('태그는 10자 이내로 입력해 주세요.');
  if (!form.tags.includes(value)) form.tags.push(value);
  tagInput.value = '';
};

const removeTag = (index) => form.tags.splice(index, 1);

const validateForm = () => {
  if (form.title.trim().length < 2 || form.title.trim().length > 60) return alert('제목을 2자 이상 입력해 주세요.'), false;
  if (form.content.trim().length < 5 || form.content.trim().length > 2000) return alert('내용을 5자 이상 입력해 주세요.'), false;
  if (!/^[a-zA-Z0-9]{4,12}$/.test(form.password)) return alert('수정·삭제용 비밀번호를 4자 이상 입력해 주세요.'), false;
  return true;
};

const submitPost = () => {
  if (!validateForm()) return;

  const now = new Date().toISOString();
  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: form.title.trim(),
    content: form.content.trim(),
    author: '익명',
    password: form.password,
    placeId: null,
    tags: [...form.tags],
    viewCount: 0,
    likeCount: 0,
    isBookmarked: false,
    imageDataUrl: null,
    createdAt: now,
    updatedAt: now
  };

  postService.addPost(newPost);
  alert('게시글이 성공적으로 작성되었습니다.');

  // 1. 목록 데이터 최신화
  posts.value = postService.getAllPosts(); 
  
  // 2. 모달 닫기 및 폼 초기화
  isModalOpen.value = false;
  Object.assign(form, getInitialForm());
  
  // 3. 최신 글을 보기 위해 1페이지로 이동
  resetPage();
};
</script>

<style scoped>
/* 모달 전용 스타일 (기존 스타일 css 파일에 병합 가능) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
/* 모달 바깥쪽을 클릭했을 때(@click.self) 모달이 닫히도록 로직이 포함되어 있습니다. */
</style>