<template>
  <div class="community-page page-shell">
    <!-- ===== HERO ===== -->
    <div class="hero-card fade-up">
      <div class="hero-copy">
        <p class="eyebrow">Community</p>
        <h1>커뮤니티</h1>
        <p class="subtitle">사용자 후기와 운동 루트를 공유해보세요.</p>
        <p class="hero-stat">
          <strong>{{ posts.length }}</strong>개의 글이 공유됐어요
        </p>
      </div>
      <div class="hero-actions">
        <button @click="openModal" class="hero-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          글쓰기
        </button>
      </div>
    </div>

    <!-- ===== 검색 · 정렬 (히어로에 도킹) ===== -->
    <section class="controls fade-up" aria-label="게시글 검색 및 정렬">
      <div class="search-field" :class="{ 'is-active': searchQuery }">
        <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" />
        </svg>
        <input
          v-model="searchQuery"
          @keydown.enter="applyImmediateSearch"
          placeholder="제목, 내용, 태그 검색"
          class="search-input"
          aria-label="검색어 입력"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-btn"
          @click="clearSearch"
          aria-label="검색어 지우기"
        >×</button>
        <button type="button" class="search-btn" @click="applyImmediateSearch">검색</button>
      </div>

      <div class="segmented" role="group" aria-label="정렬 기준">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          type="button"
          class="seg-btn"
          :class="{ 'is-on': sortOrder === opt.value }"
          :aria-pressed="sortOrder === opt.value"
          @click="setSort(opt.value)"
        >{{ opt.label }}</button>
      </div>
    </section>

    <!-- ===== 결과 요약 ===== -->
    <div class="result-bar" v-if="debouncedSearchTerm || activeTag">
      <p class="result-text">
        <template v-if="activeTag">
          <span class="chip chip-active">#{{ activeTag }}</span>
        </template>
        <template v-else>
          '<strong>{{ debouncedSearchTerm }}</strong>'
        </template>
        검색 결과 <strong>{{ filteredAndSortedPosts.length }}</strong>건
      </p>
      <button type="button" class="text-btn" @click="clearSearch">전체 보기</button>
    </div>

    <!-- ===== 게시글 목록 ===== -->
    <section v-if="paginatedPosts.length > 0" class="list-section fade-up">
      <ul class="post-list">
        <li v-for="post in paginatedPosts" :key="post.id">
          <article
            class="post-card"
            role="button"
            tabindex="0"
            @click="goToDetail(post.id)"
            @keydown.enter.prevent="goToDetail(post.id)"
            @keydown.space.prevent="goToDetail(post.id)"
          >
            <div class="post-body">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ truncateText(post.content, 110) }}</p>

              <ul v-if="post.tags && post.tags.length" class="chip-row">
                <li v-for="tag in post.tags" :key="tag">
                  <button type="button" class="chip" @click.stop="searchByTag(tag)">#{{ tag }}</button>
                </li>
              </ul>
            </div>

            <footer class="post-foot">
              <span class="avatar" aria-hidden="true">{{ (post.author || '익명').charAt(0) }}</span>
              <span class="author">{{ post.author || '익명' }}</span>
              <span class="dot" aria-hidden="true">·</span>
              <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
              <span class="views">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.6" />
                </svg>
                {{ post.viewCount || 0 }}
              </span>
            </footer>
          </article>
        </li>
      </ul>

      <!-- 페이지네이션 -->
      <nav class="pagination" aria-label="페이지 이동" v-if="totalPages > 1">
        <button class="page-nav" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-buttons">
          <template v-for="(p, i) in pages" :key="`p-${i}`">
            <span v-if="p === '…'" class="page-gap">…</span>
            <button
              v-else
              class="page-btn"
              :class="{ 'is-on': p === currentPage }"
              :aria-current="p === currentPage ? 'page' : undefined"
              @click="changePage(p)"
            >{{ p }}</button>
          </template>
        </div>
        <button class="page-nav" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
      </nav>
    </section>

    <!-- ===== 빈 상태 ===== -->
    <section v-else class="empty-state fade-up">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
      </div>
      <template v-if="debouncedSearchTerm || activeTag">
        <h3>조건에 맞는 글이 없어요</h3>
        <p>다른 키워드로 찾거나 전체 목록을 확인해 보세요.</p>
        <button class="hero-btn solid" @click="clearSearch">전체 보기</button>
      </template>
      <template v-else>
        <h3>아직 글이 없어요</h3>
        <p>첫 후기를 남기고 커뮤니티를 시작해 보세요.</p>
        <button class="hero-btn solid" @click="openModal">첫 게시글 작성하기</button>
      </template>
    </section>

    <!-- ===== 글쓰기 모달 ===== -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">새 게시글 작성</h2>
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
            <ul class="chip-row" v-if="form.tags.length > 0">
              <li v-for="(tag, index) in form.tags" :key="index">
                <span class="chip chip-removable">
                  #{{ tag }}
                  <button type="button" @click="removeTag(index)" :aria-label="`${tag} 삭제`">×</button>
                </span>
              </li>
            </ul>
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
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { postService } from '../servies/postService';

const router = useRouter();

// --- 1. 목록 상태 ---
const posts = ref(postService.getAllPosts() || []);
const searchQuery = ref('');
const debouncedSearchTerm = ref('');
const activeTag = ref('');
let searchTimer = null;
const sortOrder = ref('latest');
const currentPage = ref(1);
const itemsPerPage = 10;

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회수순' }
];

// --- 2. 검색 · 정렬 ---
const filteredAndSortedPosts = computed(() => {
  let result = [...posts.value];

  if (activeTag.value) {
    const t = activeTag.value.toLowerCase();
    result = result.filter(post => post.tags?.some(tag => tag.toLowerCase() === t));
  } else if (debouncedSearchTerm.value) {
    const query = debouncedSearchTerm.value.toLowerCase();
    result = result.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (sortOrder.value === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
  return result;
});

// --- 3. 페이징 ---
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSortedPosts.value.length / itemsPerPage))
);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredAndSortedPosts.value.slice(start, start + itemsPerPage);
});

// 페이지가 많아져도 번호가 넘치지 않도록 1 … 4 5 6 … 20 형태로 압축
const pages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out = [1];
  const start = Math.max(2, cur - 1);
  const end = Math.min(total - 1, cur + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
});

const resetPage = () => { currentPage.value = 1; };

const setSort = (value) => {
  sortOrder.value = value;
  resetPage();
};

const clearSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchQuery.value = '';
  debouncedSearchTerm.value = '';
  activeTag.value = '';
  resetPage();
};

const applyImmediateSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  activeTag.value = '';
  debouncedSearchTerm.value = searchQuery.value;
  resetPage();
};

const searchByTag = (tag) => {
  activeTag.value = tag;
  searchQuery.value = '';
  debouncedSearchTerm.value = '';
  resetPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(searchQuery, (v) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    activeTag.value = '';
    debouncedSearchTerm.value = v;
    resetPage();
  }, 300);
});

onBeforeUnmount(() => { if (searchTimer) clearTimeout(searchTimer); });

const changePage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const goToDetail = (id) => { router.push(`/community/${id}`); };

// --- 4. 모달 · 글쓰기 ---
const isModalOpen = ref(false);
const tagInput = ref('');

const getInitialForm = () => ({ title: '', content: '', password: '', tags: [] });
const form = reactive(getInitialForm());

const openModal = () => { isModalOpen.value = true; };

const closeModal = () => {
  if (form.title || form.content) {
    if (!confirm('작성을 취소하시겠습니까? 작성 중인 내용은 저장되지 않습니다.')) return;
  }
  isModalOpen.value = false;
  Object.assign(form, getInitialForm());
  tagInput.value = '';
};

const addTag = () => {
  const value = tagInput.value.trim().replace(/^#/, '');
  if (!value) return;
  if (form.tags.length >= 5) return alert('태그는 최대 5개까지 입력할 수 있습니다.');
  if (value.length > 10) return alert('태그는 10자 이내로 입력해 주세요.');
  if (!form.tags.includes(value)) form.tags.push(value);
  tagInput.value = '';
};

const removeTag = (index) => { form.tags.splice(index, 1); };

const validateForm = () => {
  const title = form.title.trim();
  const content = form.content.trim();
  if (title.length < 2 || title.length > 60) {
    alert('제목을 2~60자로 입력해 주세요.');
    return false;
  }
  if (content.length < 5 || content.length > 2000) {
    alert('내용을 5~2000자로 입력해 주세요.');
    return false;
  }
  if (!/^[a-zA-Z0-9]{4,12}$/.test(form.password)) {
    alert('비밀번호는 영문·숫자 조합 4~12자로 입력해 주세요.');
    return false;
  }
  return true;
};

const submitPost = () => {
  if (!validateForm()) return;
  const now = new Date().toISOString();

  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
  posts.value = postService.getAllPosts();
  isModalOpen.value = false;
  Object.assign(form, getInitialForm());
  tagInput.value = '';
  clearSearch();
  sortOrder.value = 'latest';
};

// --- 5. 유틸 ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  if (min < 60 * 24 * 7) return `${Math.floor(min / (60 * 24))}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
};
</script>

<style scoped>
/* ---------- 공통 아이콘 ---------- */
svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- HERO ---------- */
.hero-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 36px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand-1) 100%);
  color: var(--accent);
  box-shadow: var(--shadow-lg);
}
.hero-card h1 { margin: 0 0 6px; font-size: 1.6rem; letter-spacing: -0.02em; }
.subtitle { margin: 0; color: rgba(255, 247, 239, 0.95); }
.hero-stat {
  margin: 14px 0 0;
  font-size: 0.85rem;
  color: rgba(255, 247, 239, 0.75);
}
.hero-stat strong { color: var(--accent); }
.hero-actions { display: flex; align-items: center; }

.hero-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--card-bg); color: var(--brand-2);
  padding: 11px 20px; border: none; border-radius: 999px;
  font-weight: 700; font-size: 0.95rem; cursor: pointer;
  box-shadow: 0 8px 20px rgba(56, 33, 15, 0.18);
  transition: transform var(--transition-default), box-shadow var(--transition-default);
}
.hero-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(56, 33, 15, 0.24); }
.hero-btn.solid { background: var(--brand-2); color: #fff; }

/* ---------- 검색 · 정렬 (히어로에 도킹) ---------- */
.controls {
  position: relative;
  z-index: 2;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--card-bg);
  border: 1px solid rgba(120, 88, 60, 0.1);
  border-radius: 999px;
  box-shadow: 0 16px 34px rgba(56, 33, 15, 0.12);
}

.search-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(247, 235, 220, 0.5);
  transition: border-color var(--transition-default), background var(--transition-default);
}
.search-field:focus-within { border-color: var(--brand-2); background: var(--card-bg); }
.search-icon { color: var(--muted); flex-shrink: 0; }

.search-input {
  flex: 1;
  min-width: 0;
  padding: 9px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--color-text);
}
.search-input:focus { outline: none; }

.clear-btn {
  width: 22px; height: 22px; flex-shrink: 0;
  display: grid; place-items: center;
  border: none; border-radius: 50%;
  background: rgba(120, 88, 60, 0.16); color: var(--color-text);
  font-size: 0.9rem; line-height: 1; cursor: pointer;
}
.clear-btn:hover { background: rgba(120, 88, 60, 0.3); }

.search-btn {
  flex-shrink: 0;
  padding: 9px 18px;
  border: none; border-radius: 999px;
  background: var(--brand-2); color: #fff;
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: filter var(--transition-default);
}
.search-btn:hover { filter: brightness(1.08); }

/* 세그먼트형 정렬 — select보다 탭 수가 적을 때 클릭 1번으로 끝남 */
.segmented {
  display: flex; gap: 2px; flex-shrink: 0;
  padding: 3px;
  background: rgba(247, 235, 220, 0.7);
  border-radius: 999px;
}
.seg-btn {
  padding: 8px 16px;
  border: none; border-radius: 999px;
  background: transparent; color: var(--muted);
  font-size: 0.86rem; font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: background var(--transition-default), color var(--transition-default);
}
.seg-btn.is-on { background: var(--card-bg); color: var(--brand-2); box-shadow: var(--shadow-md); }

/* ---------- 결과 요약 ---------- */
.result-bar {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  margin: 0 4px 12px;
}
.result-text { margin: 0; font-size: 0.9rem; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.result-text strong { color: var(--color-text); }
.text-btn {
  border: none; background: none; padding: 4px;
  color: var(--brand-2); font-weight: 700; font-size: 0.86rem; cursor: pointer;
  text-decoration: underline; text-underline-offset: 3px;
}

/* ---------- 목록 ---------- */
.list-section { padding: 0; background: none; border: none; box-shadow: none; }
.post-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }

/* 이중 카드(리스트 카드 안의 카드)를 없애고 한 겹으로 정리 */
.post-card {
  display: block;
  padding: 20px 22px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(120, 88, 60, 0.1);
  box-shadow: 0 6px 18px rgba(56, 33, 15, 0.05);
  cursor: pointer;
  transition: transform var(--transition-default), box-shadow var(--transition-default), border-color var(--transition-default);
}
.post-card:hover { transform: translateY(-3px); border-color: rgba(120, 88, 60, 0.24); box-shadow: var(--shadow-lg); }
.post-card:focus-visible { outline: 2px solid var(--brand-2); outline-offset: 3px; }

.post-title {
  margin: 0 0 6px;
  font-size: 1.08rem; font-weight: 700; line-height: 1.4;
  color: var(--color-text);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.post-excerpt {
  margin: 0;
  color: var(--muted); font-size: 0.92rem; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* 태그는 한 덩어리 문자열 대신 개별 칩 — 눌러서 바로 필터 */
.chip-row { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 12px 0 0; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border: 1px solid rgba(120, 88, 60, 0.14); border-radius: 999px;
  background: rgba(247, 235, 220, 0.7);
  color: var(--brand-2); font-size: 0.78rem; font-weight: 700;
  cursor: pointer;
}
.chip:hover { background: var(--brand-2); color: #fff; border-color: var(--brand-2); }
.chip-active { background: var(--brand-2); color: #fff; border-color: var(--brand-2); cursor: default; }
.chip-removable { cursor: default; }
.chip-removable button { border: none; background: none; color: inherit; cursor: pointer; font-size: 0.9rem; padding: 0 0 0 2px; }

/* 메타는 오른쪽 세로 정렬 대신 하단 한 줄 — 모바일에서도 안 깨짐 */
.post-foot {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px; padding-top: 12px;
  border-top: 1px dashed rgba(120, 88, 60, 0.14);
  color: var(--muted); font-size: 0.82rem;
}
.avatar {
  width: 22px; height: 22px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-2), var(--brand-1));
  color: var(--accent); font-size: 0.7rem; font-weight: 700;
}
.author { font-weight: 600; color: var(--color-text); }
.dot { opacity: 0.5; }
.views { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; }
.views svg { width: 14px; height: 14px; }

/* ---------- 페이지네이션 ---------- */
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; }
.page-buttons { display: flex; align-items: center; gap: 4px; }
.page-nav, .page-btn {
  min-width: 36px; height: 36px; padding: 0 12px;
  border: 1px solid rgba(120, 88, 60, 0.12); border-radius: 10px;
  background: var(--card-bg); color: var(--color-text);
  font-size: 0.86rem; font-weight: 600; cursor: pointer;
  transition: background var(--transition-default), color var(--transition-default);
}
.page-btn { padding: 0; }
.page-nav:disabled { opacity: 0.4; cursor: not-allowed; }
.page-nav:not(:disabled):hover, .page-btn:hover { background: rgba(247, 235, 220, 0.9); }
.page-btn.is-on { background: var(--brand-2); border-color: var(--brand-2); color: #fff; }
.page-gap { padding: 0 4px; color: var(--muted); }

/* ---------- 빈 상태 ---------- */
.empty-state {
  display: grid; justify-items: center; gap: 6px;
  padding: 56px 24px;
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

/* ---------- 모달 ---------- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(38, 24, 12, 0.55);
  backdrop-filter: blur(3px);
  display: flex; justify-content: center; align-items: center;
  padding: 20px; z-index: 1000;
}
.modal-content {
  background: var(--card-bg);
  padding: 26px;
  border-radius: 18px;
  width: 100%; max-width: 520px; max-height: 88vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.modal-content h2 { margin: 0 0 14px; font-size: 1.2rem; color: var(--color-text); }
.warning-box {
  padding: 10px 12px; margin-bottom: 18px;
  border-radius: 10px;
  background: rgba(247, 235, 220, 0.8);
  border: 1px solid rgba(120, 88, 60, 0.14);
}
.warning-box p { margin: 0; font-size: 0.82rem; color: var(--muted); }

.write-form { display: grid; gap: 16px; }
.form-group { display: grid; gap: 6px; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: var(--color-text); }
.required { color: #c0392b; }
.form-group input,
.form-group textarea {
  width: 100%; padding: 11px 13px;
  border: 1px solid rgba(120, 88, 60, 0.18); border-radius: 10px;
  background: rgba(250, 246, 239, 0.6);
  font: inherit; font-size: 0.92rem; color: var(--color-text);
  resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus { outline: none; border-color: var(--brand-2); background: var(--card-bg); }

.tag-input-wrap { display: flex; gap: 8px; }
.tag-input-wrap button {
  flex-shrink: 0; padding: 0 16px;
  border: 1px solid rgba(120, 88, 60, 0.18); border-radius: 10px;
  background: rgba(247, 235, 220, 0.8); color: var(--brand-2);
  font-weight: 700; font-size: 0.86rem; cursor: pointer;
}
.tag-input-wrap button:disabled { opacity: 0.45; cursor: not-allowed; }

.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.btn-cancel, .btn-submit {
  padding: 11px 22px; border-radius: 999px;
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
}
.btn-cancel { border: 1px solid rgba(120, 88, 60, 0.2); background: transparent; color: var(--muted); }
.btn-submit { border: none; background: var(--brand-2); color: #fff; }
.btn-submit:hover { filter: brightness(1.08); }

/* ---------- 반응형 ---------- */
@media (max-width: 900px) {
  .hero-card { grid-template-columns: 1fr; padding: 24px; }
  .hero-actions { justify-content: flex-start; }
  .controls {
    margin: 20px 0;
    flex-direction: column;
    align-items: stretch;
    border-radius: 18px;
    padding: 12px;
  }
  .segmented { justify-content: stretch; }
  .seg-btn { flex: 1; }
  .post-card { padding: 16px 18px; }
  .page-nav { padding: 0 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .post-card, .hero-btn { transition: none; }
  .post-card:hover, .hero-btn:hover { transform: none; }
}
</style>