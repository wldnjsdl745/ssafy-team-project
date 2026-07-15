<template>
  <div class="community-detail-page" v-if="post">
    <!-- 1. 상세 조회 모드 -->
    <div v-if="!isEditing" class="post-viewer">
      <div class="post-header">
        <button @click="goBack" class="btn-back">← 목록으로</button>
        <h2>{{ post.title }}</h2>
        <div class="meta-info">
          <span>작성자: {{ post.author }}</span> |
          <span>조회수: {{ post.viewCount }}</span> |
          <span>작성일: {{ formatDate(post.createdAt) }}</span>
          <span v-if="post.updatedAt !== post.createdAt"> (수정됨: {{ formatDate(post.updatedAt) }})</span>
        </div>
      </div>

      <div class="post-body">
        <p class="content-text">{{ post.content }}</p>
      </div>

      <!-- 상호작용(좋아요, 북마크) 영역 -->
      <div class="interaction-bar">
        <button 
          @click="handleLike" 
          :class="['btn-interact', { 'active': isLiked }]"
        >
          {{ isLiked ? '❤️' : '🤍' }} 좋아요 {{ post.likeCount || 0 }}
        </button>
        
        <button 
          @click="handleBookmark" 
          :class="['btn-interact', { 'active': isBookmarked }]"
        >
          {{ isBookmarked ? '🔖 북마크 취소' : '📑 북마크 저장' }}
        </button>
      </div>

      <div class="post-actions">
        <button @click="openPasswordModal('edit')" class="btn-edit">수정</button>
        <button @click="openPasswordModal('delete')" class="btn-delete">삭제</button>
      </div>
    </div>

    <!-- 2. 게시글 수정 모드 -->
    <div v-else class="post-editor">
      <h2>게시글 수정</h2>
      <form @submit.prevent="submitEdit" class="write-form">
        <div class="form-group">
          <label>제목 <span class="required">*</span></label>
          <input v-model="editForm.title" type="text" placeholder="2~60자" />
        </div>

        <div class="form-group">
          <label>내용 <span class="required">*</span></label>
          <textarea v-model="editForm.content" rows="6" placeholder="5~2000자"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="cancelEdit" class="btn-cancel">취소</button>
          <button type="submit" class="btn-submit">수정 완료</button>
        </div>
      </form>
    </div>

    <!-- 3. 비밀번호 확인 모달 -->
    <div v-if="isPasswordModalOpen" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content password-modal">
        <h3>비밀번호 확인</h3>
        <p>게시글을 {{ pendingAction === 'edit' ? '수정' : '삭제' }}하려면 비밀번호를 입력하세요.</p>
        <div class="form-group">
          <input 
            v-model="passwordInput" 
            type="password" 
            placeholder="비밀번호 입력" 
            @keydown.enter="confirmPassword"
          />
        </div>
        <div class="form-actions">
          <button @click="closePasswordModal" class="btn-cancel">취소</button>
          <button @click="confirmPassword" class="btn-submit">확인</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 게시글을 찾을 수 없는 경우 -->
  <div v-else class="not-found">
    <p>존재하지 않거나 삭제된 게시글입니다.</p>
    <button @click="goBack" class="btn-primary">목록으로 돌아가기</button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { postService } from '../servies/postService';

const route = useRoute();
const router = useRouter();

const post = ref(null);
const isEditing = ref(false);

// 비밀번호 모달 상태 관리
const isPasswordModalOpen = ref(false);
const passwordInput = ref('');
const pendingAction = ref(''); // 'edit' 또는 'delete'

// 좋아요/북마크 상태 관리
const isLiked = ref(false);
const isBookmarked = ref(false);

// 수정 폼 상태
const editForm = reactive({
  title: '',
  content: ''
});

// 초기 데이터 로드
onMounted(() => {
  const postId = route.params.id;
  const fetchedPost = postService.getPostById(postId);

  if (fetchedPost) {
    fetchedPost.viewCount = (fetchedPost.viewCount || 0) + 1;
    postService.updatePost(fetchedPost);
    post.value = fetchedPost;

    // 현재 게시글의 좋아요/북마크 여부 확인
    isLiked.value = postService.isLiked(postId);
    isBookmarked.value = postService.isBookmarked(postId);
  }
});

const goBack = () => {
  router.push('/community');
};

// --- 좋아요/북마크 핸들러 ---
const handleLike = () => {
  const result = postService.toggleLike(post.value.id);
  isLiked.value = result.isLiked;
  post.value.likeCount = result.likeCount;
};

const handleBookmark = () => {
  const result = postService.toggleBookmark(post.value.id);
  isBookmarked.value = result;
  
  if (result) {
    alert('북마크에 추가되었습니다.');
  } else {
    alert('북마크가 해제되었습니다.');
  }
};

// --- 모달 제어 및 비밀번호 검증 로직 ---
const openPasswordModal = (action) => {
  pendingAction.value = action;
  passwordInput.value = '';
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
  passwordInput.value = '';
  pendingAction.value = '';
};

const confirmPassword = () => {
  if (passwordInput.value !== post.value.password) {
    alert('비밀번호가 일치하지 않습니다.');
    passwordInput.value = ''; 
    return;
  }

  if (pendingAction.value === 'delete') {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      postService.deletePost(post.value.id);
      alert('삭제되었습니다.');
      closePasswordModal();
      router.replace('/community');
    }
  } else if (pendingAction.value === 'edit') {
    editForm.title = post.value.title;
    editForm.content = post.value.content;
    isEditing.value = true;
    closePasswordModal();
  }
};

const cancelEdit = () => {
  if (confirm('수정을 취소하시겠습니까? 변경 사항은 저장되지 않습니다.')) {
    isEditing.value = false;
  }
};

const submitEdit = () => {
  if (editForm.title.trim().length < 2 || editForm.content.trim().length < 5) {
    alert('제목은 2자, 내용은 5자 이상 입력해 주세요.');
    return;
  }

  const updatedPost = {
    ...post.value,
    title: editForm.title.trim(),
    content: editForm.content.trim(),
    updatedAt: new Date().toISOString()
  };

  postService.updatePost(updatedPost);
  post.value = updatedPost;
  isEditing.value = false;
  alert('수정되었습니다.');
};

// ⭐️ 잃어버렸던 날짜 포맷 함수 복구! ⭐️
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.post-header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.meta-info { color: #666; font-size: 0.9em; margin-top: 8px; }
.content-text { white-space: pre-wrap; line-height: 1.6; }
.post-actions { margin-top: 30px; display: flex; gap: 10px; }
.not-found { text-align: center; padding: 50px; }

/* 상호작용 버튼 (좋아요/북마크) */
.interaction-bar {
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-interact {
  padding: 8px 16px;
  border: 1px solid #d8e1e8;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-interact:hover {
  background-color: #f5f7f9;
}

.btn-interact.active {
  border-color: #2d6a93;
  color: #2d6a93;
  background-color: #eaf4fb;
  font-weight: bold;
}

/* 모달 스타일 */
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
}
.password-modal {
  max-width: 350px; 
}
.password-modal p {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}
</style>