<template>
  <div class="community-page">
    <div class="page-header">
      <h2>커뮤니티</h2>
      <button @click="openModal" class="btn-primary">글쓰기</button>
    </div>

    <!-- 검색 및 정렬 컨트롤 -->
    <div class="controls">
      <input
        v-model="searchQuery"
        @input="resetPage"
        placeholder="제목, 내용, 태그 검색"
        class="search-input"
      />
      <select v-model="sortOrder" @change="resetPage" class="sort-select">
        <option value="latest">최신순</option>
        <option value="views">조회수순</option>
      </select>
    </div>

    <!-- 검색 결과 수 표시 -->
    <div v-if="searchQuery" class="search-result-info">
      <p>검색 결과 <strong>{{ filteredAndSortedPosts.length }}</strong>건</p>
    </div>

    <!-- 게시글 목록 -->
    <template v-if="paginatedPosts.length > 0">
      <ul class="post-list">
        <li 
          v-for="post in paginatedPosts" 
          :key="post.id" 
          @click="goToDetail(post.id)"
          class="post-item"
        >
          <div class="post-main">
            <h3>{{ post.title }}</h3>
            <p class="post-content-preview">{{ truncateText(post.content, 50) }}</p>
          </div>
          <div class="post-meta">
            <span v-if="post.tags && post.tags.length" class="tags">
              {{ post.tags.map(tag => `#${tag}`).join(' ') }}
            </span>
            <div class="meta-info">
              <span>조회수 {{ post.viewCount || 0 }}</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
        </li>
      </ul>

      <!-- 페이지 기능 -->
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </template>

    <!-- 게시글 빈 상태 (작성 유도) -->
    <template v-else>
      <div class="empty-state">
        <p v-if="searchQuery">검색 결과가 없습니다.</p>
        <div v-else>
          <p>아직 작성된 게시글이 없습니다.</p>
          <button @click="openModal" class="btn-primary">첫 게시글 작성하기</button>
        </div>
      </div>
    </template>

    <!-- 글쓰기 모달 창 영역 -->
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
                :disabled="form.tags.length >= 5"
              />
              <button type="button" @click="addTag" :disabled="form.tags.length >= 5">추가</button>
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
import { postService } from '../servies/postService';

const router = useRouter();

// --- 1. 목록 상태 관리 ---
const posts = ref(postService.getAllPosts() || []);
const searchQuery = ref('');
const sortOrder = ref('latest'); // 기본 정렬: 최신순
const currentPage = ref(1);
const itemsPerPage = 10; // 페이지당 노출할 게시글 수

// --- 2. 목록 검색 및 정렬 로직 ---
const filteredAndSortedPosts = computed(() => {
  let result = [...posts.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(post => 
      post.title?.toLowerCase().includes(query) || 
      post.content?.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  if (sortOrder.value === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOrder.value === 'views') {
    result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
  
  return result;
});

// --- 3. 페이징 로직 ---
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredAndSortedPosts.value.length / itemsPerPage));
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedPosts.value.slice(start, end);
});

const resetPage = () => {
  currentPage.value = 1;
};

const changePage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const goToDetail = (id) => {
  router.push(`/community/${id}`);
};

// --- 4. 모달 및 글쓰기 폼 로직 ---
const isModalOpen = ref(false);
const tagInput = ref('');

// 폼 초기화용 팩토리 함수
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
  Object.assign(form, getInitialForm()); // 폼 상태 초기화
  tagInput.value = '';
};

// 태그 기능
const addTag = () => {
  const value = tagInput.value.trim();
  if (!value) return;
  
  if (form.tags.length >= 5) {
    alert('태그는 최대 5개까지 입력할 수 있습니다.');
    return;
  }
  if (value.length > 10) {
    alert('태그는 10자 이내로 입력해 주세요.');
    return;
  }

  if (!form.tags.includes(value)) {
    form.tags.push(value);
  }
  tagInput.value = '';
};

const removeTag = (index) => {
  form.tags.splice(index, 1);
};

// 유효성 검증
const validateForm = () => {
  if (form.title.trim().length < 2 || form.title.trim().length > 60) {
    alert('제목을 2자 이상 입력해 주세요.');
    return false;
  }
  if (form.content.trim().length < 5 || form.content.trim().length > 2000) {
    alert('내용을 5자 이상 입력해 주세요.');
    return false;
  }
  if (!/^[a-zA-Z0-9]{4,12}$/.test(form.password)) {
    alert('수정·삭제용 비밀번호를 4자 이상 입력해 주세요.');
    return false;
  }
  return true;
};

// 게시글 등록
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

  // 서비스 호출 및 상태 갱신
  postService.addPost(newPost);
  alert('게시글이 성공적으로 작성되었습니다.');

  // 글 작성 완료 후 목록 갱신 및 모달 닫기
  posts.value = postService.getAllPosts(); 
  isModalOpen.value = false;
  Object.assign(form, getInitialForm());
  resetPage(); // 최신 글 확인을 위해 1페이지로 이동
};

// --- 5. 유틸 함수 ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
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
</style>