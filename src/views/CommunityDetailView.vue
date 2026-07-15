<template>
  <div class="community-detail-page page-shell" v-if="post">
    <!-- ===== 1. 상세 조회 ===== -->
    <template v-if="!isEditing">
      <button @click="goBack" class="btn-back">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7" /></svg>
        목록으로
      </button>

      <!-- 히어로 = 글의 머리말 -->
      <header class="hero-card fade-up">
        <p class="eyebrow">Community</p>
        <h1>{{ post.title }}</h1>

        <div class="hero-meta">
          <span class="avatar" aria-hidden="true">{{ (post.author || '익명').charAt(0) }}</span>
          <span class="author">{{ post.author || '익명' }}</span>
          <span class="dot" aria-hidden="true">·</span>
          <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
          <span v-if="isEdited" class="edited-flag">수정됨</span>
          <span class="views">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.6" />
            </svg>
            {{ post.viewCount || 0 }}
          </span>
        </div>
      </header>

      <article class="body-card fade-up">
        <ul v-if="post.tags && post.tags.length" class="chip-row">
          <li v-for="tag in post.tags" :key="tag"><span class="chip">#{{ tag }}</span></li>
        </ul>

        <p class="content-text">{{ post.content }}</p>

        <!-- 좋아요 · 북마크 -->
        <div class="interaction-bar">
          <button
            type="button"
            class="btn-interact"
            :class="{ 'is-on': isLiked }"
            :aria-pressed="isLiked"
            @click="handleLike"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ fill: isLiked ? 'currentColor' : 'none' }">
              <path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 5.8-8.5 11.3-8.5 11.3z" />
            </svg>
            좋아요 <strong>{{ post.likeCount || 0 }}</strong>
          </button>

          <button
            type="button"
            class="btn-interact"
            :class="{ 'is-on': isBookmarked }"
            :aria-pressed="isBookmarked"
            @click="handleBookmark"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ fill: isBookmarked ? 'currentColor' : 'none' }">
              <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z" />
            </svg>
            {{ isBookmarked ? '저장됨' : '북마크' }}
          </button>

          <div class="post-actions">
            <button @click="openPasswordModal('edit')" class="btn-ghost">수정</button>
            <button @click="openPasswordModal('delete')" class="btn-ghost danger">삭제</button>
          </div>
        </div>
      </article>
    </template>

    <!-- ===== 2. 수정 모드 ===== -->
    <template v-else>
      <button @click="cancelEdit" class="btn-back">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7" /></svg>
        수정 취소
      </button>

      <header class="hero-card fade-up">
        <p class="eyebrow">Edit</p>
        <h1>게시글 수정</h1>
        <p class="subtitle">내용을 고치고 저장하면 목록에 바로 반영됩니다.</p>
      </header>

      <div class="body-card fade-up">
        <form @submit.prevent="submitEdit" class="write-form">
          <div class="form-group">
            <div class="label-row">
              <label for="edit-title">제목 <span class="required">*</span></label>
              <span class="counter" :class="{ 'is-over': titleCount < 2 || titleCount > 60 }">{{ titleCount }} / 60</span>
            </div>
            <input id="edit-title" v-model="editForm.title" type="text" placeholder="2~60자" />
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="edit-content">내용 <span class="required">*</span></label>
              <span class="counter" :class="{ 'is-over': contentCount < 5 || contentCount > 2000 }">{{ contentCount }} / 2000</span>
            </div>
            <textarea id="edit-content" v-model="editForm.content" rows="10" placeholder="5~2000자"></textarea>
          </div>

          <p v-if="editError" class="form-error">{{ editError }}</p>

          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="btn-cancel">취소</button>
            <button type="submit" class="btn-submit">수정 완료</button>
          </div>
        </form>
      </div>
    </template>

    <!-- ===== 3. 비밀번호 확인 모달 ===== -->
    <div v-if="isPasswordModalOpen" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content password-modal" role="dialog" aria-modal="true" aria-labelledby="pw-title">
        <h2 id="pw-title">비밀번호 확인</h2>
        <p class="modal-desc">
          게시글을 <strong>{{ pendingAction === 'edit' ? '수정' : '삭제' }}</strong>하려면 작성 시 입력한 비밀번호를 넣어주세요.
        </p>

        <div class="form-group">
          <input
            ref="passwordField"
            v-model="passwordInput"
            type="password"
            placeholder="비밀번호 입력"
            :class="{ 'has-error': passwordError }"
            @keydown.enter="confirmPassword"
            @input="passwordError = ''"
          />
          <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
        </div>

        <div class="form-actions">
          <button @click="closePasswordModal" class="btn-cancel">취소</button>
          <button
            @click="confirmPassword"
            class="btn-submit"
            :class="{ danger: pendingAction === 'delete' }"
          >{{ pendingAction === 'delete' ? '삭제하기' : '확인' }}</button>
        </div>
      </div>
    </div>

    <!-- ===== 토스트 (alert 대체) ===== -->
    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </div>

  <!-- ===== 게시글 없음 ===== -->
  <div v-else class="page-shell">
    <section class="empty-state fade-up">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 16h.01" /></svg>
      </div>
      <h3>글을 찾을 수 없어요</h3>
      <p>이미 삭제됐거나 주소가 잘못됐을 수 있어요.</p>
      <button @click="goBack" class="hero-btn solid">목록으로 돌아가기</button>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { postService } from '../servies/postService';

const route = useRoute();
const router = useRouter();

const post = ref(null);
const isEditing = ref(false);

// 비밀번호 모달
const isPasswordModalOpen = ref(false);
const passwordInput = ref('');
const passwordError = ref('');
const passwordField = ref(null);
const pendingAction = ref('');

// 좋아요 / 북마크
const isLiked = ref(false);
const isBookmarked = ref(false);

// 수정 폼
const editForm = reactive({ title: '', content: '' });
const editError = ref('');
const titleCount = computed(() => editForm.title.trim().length);
const contentCount = computed(() => editForm.content.trim().length);

const isEdited = computed(() =>
  !!post.value && post.value.updatedAt !== post.value.createdAt
);

// 토스트
const toast = ref('');
let toastTimer = null;
const showToast = (msg) => {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ''; }, 2200);
};
onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer); });

onMounted(() => {
  const postId = route.params.id;
  const fetchedPost = postService.getPostById(postId);

  if (fetchedPost) {
    fetchedPost.viewCount = (fetchedPost.viewCount || 0) + 1;
    postService.updatePost(fetchedPost);
    post.value = fetchedPost;
    isLiked.value = postService.isLiked(postId);
    isBookmarked.value = postService.isBookmarked(postId);
  }
});

const goBack = () => { router.push('/community'); };

const handleLike = () => {
  const result = postService.toggleLike(post.value.id);
  isLiked.value = result.isLiked;
  post.value.likeCount = result.likeCount;
};

const handleBookmark = () => {
  const result = postService.toggleBookmark(post.value.id);
  isBookmarked.value = result;
  showToast(result ? '북마크에 저장했어요' : '북마크를 해제했어요');
};

// --- 모달 ---
const openPasswordModal = async (action) => {
  pendingAction.value = action;
  passwordInput.value = '';
  passwordError.value = '';
  isPasswordModalOpen.value = true;
  await nextTick();
  passwordField.value?.focus();
};

const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
  passwordInput.value = '';
  passwordError.value = '';
  pendingAction.value = '';
};

const confirmPassword = () => {
  if (passwordInput.value !== post.value.password) {
    passwordError.value = '비밀번호가 일치하지 않습니다.';
    passwordInput.value = '';
    passwordField.value?.focus();
    return;
  }

  if (pendingAction.value === 'delete') {
    if (!confirm('이 게시글을 삭제합니다. 되돌릴 수 없어요.')) return;
    postService.deletePost(post.value.id);
    closePasswordModal();
    router.replace('/community');
    return;
  }

  editForm.title = post.value.title;
  editForm.content = post.value.content;
  editError.value = '';
  isEditing.value = true;
  closePasswordModal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  const changed =
    editForm.title !== post.value.title || editForm.content !== post.value.content;
  if (changed && !confirm('수정을 취소하시겠습니까? 변경 사항은 저장되지 않습니다.')) return;
  isEditing.value = false;
  editError.value = '';
};

const submitEdit = () => {
  if (titleCount.value < 2 || titleCount.value > 60) {
    editError.value = '제목을 2~60자로 입력해 주세요.';
    return;
  }
  if (contentCount.value < 5 || contentCount.value > 2000) {
    editError.value = '내용을 5~2000자로 입력해 주세요.';
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
  editError.value = '';
  showToast('수정 내용을 저장했어요');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
</script>

<style scoped>
svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- 뒤로가기 ---------- */
.btn-back {
  display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 14px; padding: 8px 14px 8px 10px;
  border: 1px solid rgba(120, 88, 60, 0.14); border-radius: 999px;
  background: var(--card-bg); color: var(--muted);
  font-size: 0.86rem; font-weight: 600; cursor: pointer;
  transition: color var(--transition-default), border-color var(--transition-default);
}
.btn-back:hover { color: var(--brand-2); border-color: rgba(120, 88, 60, 0.3); }

/* ---------- HERO (목록과 동일 언어) ---------- */
.hero-card {
  padding: 36px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand-1) 100%);
  color: var(--accent);
  box-shadow: var(--shadow-lg);
}
.hero-card h1 {
  margin: 0;
  font-size: 1.6rem; line-height: 1.35; letter-spacing: -0.02em;
  word-break: keep-all;
}
.subtitle { margin: 8px 0 0; color: rgba(255, 247, 239, 0.9); }

.hero-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin-top: 18px; padding-top: 16px;
  border-top: 1px solid rgba(255, 247, 239, 0.18);
  color: rgba(255, 247, 239, 0.72); font-size: 0.84rem;
}
.avatar {
  width: 24px; height: 24px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: rgba(255, 247, 239, 0.9); color: var(--brand-2);
  font-size: 0.72rem; font-weight: 700;
}
.author { font-weight: 700; color: var(--accent); }
.dot { opacity: 0.5; }
.edited-flag {
  padding: 2px 8px; border-radius: 999px;
  background: rgba(255, 247, 239, 0.16);
  font-size: 0.72rem; font-weight: 600;
}
.views { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; }
.views svg { width: 14px; height: 14px; }

/* ---------- 본문 ---------- */
.body-card {
  margin-top: 20px;
  padding: 28px;
  background: var(--card-bg);
  border: 1px solid rgba(120, 88, 60, 0.1);
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(56, 33, 15, 0.05);
}
.content-text {
  margin: 0;
  white-space: pre-wrap; word-break: break-word;
  line-height: 1.8; font-size: 0.98rem; color: var(--color-text);
}

.chip-row { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0 0 18px; }
.chip {
  display: inline-flex; padding: 4px 10px;
  border: 1px solid rgba(120, 88, 60, 0.14); border-radius: 999px;
  background: rgba(247, 235, 220, 0.7);
  color: var(--brand-2); font-size: 0.78rem; font-weight: 700;
}

/* ---------- 상호작용 ---------- */
.interaction-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin-top: 32px; padding-top: 20px;
  border-top: 1px dashed rgba(120, 88, 60, 0.16);
}
.btn-interact {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border: 1px solid rgba(120, 88, 60, 0.16); border-radius: 999px;
  background: var(--card-bg); color: var(--muted);
  font-size: 0.86rem; font-weight: 600; cursor: pointer;
  transition: color var(--transition-default), border-color var(--transition-default), background var(--transition-default);
}
.btn-interact strong { color: var(--color-text); }
.btn-interact:hover { border-color: rgba(120, 88, 60, 0.34); color: var(--color-text); }
.btn-interact.is-on {
  background: rgba(247, 235, 220, 0.9);
  border-color: var(--brand-2);
  color: var(--brand-2);
}
.btn-interact.is-on strong { color: var(--brand-2); }

/* 수정·삭제는 주요 동작이 아니므로 오른쪽 끝에 조용히 */
.post-actions { margin-left: auto; display: flex; gap: 4px; }
.btn-ghost {
  padding: 9px 12px;
  border: none; border-radius: 10px;
  background: none; color: var(--muted);
  font-size: 0.84rem; font-weight: 600; cursor: pointer;
}
.btn-ghost:hover { background: rgba(247, 235, 220, 0.9); color: var(--color-text); }
.btn-ghost.danger:hover { background: rgba(192, 57, 43, 0.08); color: #c0392b; }

/* ---------- 폼 ---------- */
.write-form { display: grid; gap: 18px; }
.form-group { display: grid; gap: 6px; }
.label-row { display: flex; justify-content: space-between; align-items: baseline; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: var(--color-text); }
.required { color: #c0392b; }
.counter { font-size: 0.76rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.counter.is-over { color: #c0392b; font-weight: 700; }

.form-group input,
.form-group textarea {
  width: 100%; padding: 11px 13px;
  border: 1px solid rgba(120, 88, 60, 0.18); border-radius: 10px;
  background: rgba(250, 246, 239, 0.6);
  font: inherit; font-size: 0.92rem; color: var(--color-text);
  line-height: 1.7; resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus { outline: none; border-color: var(--brand-2); background: var(--card-bg); }
.form-group input.has-error { border-color: #c0392b; }

.form-error { margin: 0; font-size: 0.82rem; color: #c0392b; font-weight: 600; }

.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.btn-cancel, .btn-submit {
  padding: 11px 22px; border-radius: 999px;
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
}
.btn-cancel { border: 1px solid rgba(120, 88, 60, 0.2); background: transparent; color: var(--muted); }
.btn-submit { border: none; background: var(--brand-2); color: #fff; }
.btn-submit:hover { filter: brightness(1.08); }
.btn-submit.danger { background: #c0392b; }

/* ---------- 모달 ---------- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(38, 24, 12, 0.55);
  backdrop-filter: blur(3px);
  display: flex; justify-content: center; align-items: center;
  padding: 20px; z-index: 1000;
}
.modal-content {
  width: 100%; max-width: 520px;
  padding: 26px;
  background: var(--card-bg);
  border-radius: 18px;
  box-shadow: var(--shadow-lg);
}
.modal-content h2 { margin: 0 0 8px; font-size: 1.15rem; color: var(--color-text); }
.password-modal { max-width: 380px; }
.modal-desc { margin: 0 0 18px; font-size: 0.86rem; line-height: 1.6; color: var(--muted); }
.modal-desc strong { color: var(--color-text); }

/* ---------- 빈 상태 ---------- */
.empty-state {
  display: grid; justify-items: center; gap: 6px;
  padding: 64px 24px;
  background: var(--card-bg);
  border: 1px dashed rgba(120, 88, 60, 0.22);
  border-radius: 18px;
  text-align: center;
}
.empty-icon {
  width: 52px; height: 52px; margin-bottom: 10px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: rgba(247, 235, 220, 0.9); color: var(--brand-2);
}
.empty-icon svg { width: 24px; height: 24px; }
.empty-state h3 { margin: 0; font-size: 1.05rem; color: var(--color-text); }
.empty-state p { margin: 0 0 16px; color: var(--muted); font-size: 0.9rem; }
.hero-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  border: none; border-radius: 999px;
  background: var(--card-bg); color: var(--brand-2);
  font-weight: 700; font-size: 0.95rem; cursor: pointer;
  box-shadow: 0 8px 20px rgba(56, 33, 15, 0.18);
}
.hero-btn.solid { background: var(--brand-2); color: #fff; }

/* ---------- 토스트 ---------- */
.toast {
  position: fixed; left: 50%; bottom: 32px;
  transform: translateX(-50%);
  padding: 12px 22px;
  border-radius: 999px;
  background: var(--brand-2); color: var(--accent);
  font-size: 0.88rem; font-weight: 600;
  box-shadow: var(--shadow-lg);
  z-index: 1100;
}
.toast-enter-active, .toast-leave-active { transition: opacity 0.24s, transform 0.24s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }

/* ---------- 반응형 ---------- */
@media (max-width: 900px) {
  .hero-card { padding: 24px; }
  .hero-card h1 { font-size: 1.3rem; }
  .body-card { padding: 20px; }
  .views { margin-left: 0; }
  .post-actions { margin-left: 0; width: 100%; justify-content: flex-end; }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active, .toast-leave-active { transition: none; }
}
</style>