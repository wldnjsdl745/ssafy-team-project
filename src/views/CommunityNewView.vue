<template>
  <div class="community-page page-shell">
    <div class="hero-card fade-up">
      <div>
        <p class="eyebrow">Community</p>
        <h1>커뮤니티</h1>
        <p class="subtitle">새 글 작성 및 목록 확인</p>
      </div>
      <div class="hero-actions">
        <button @click="openModal" class="primary-btn">글쓰기</button>
      </div>
    </div>

    <div class="controls container-card fade-up">
      <div class="search-row">
        <input v-model="searchQuery" class="search-input" placeholder="제목, 내용, 태그 검색" aria-label="검색어 입력" />
        <button type="button" class="primary-btn" @click="applyImmediateSearch">검색</button>
        <button type="button" class="btn-cancel" @click="clearSearch">초기화</button>
      </div>
      <div class="sort-row">
        <select v-model="sortOrder" @change="resetPage" class="sort-select">
          <option value="latest">최신순</option>
          <option value="views">조회수순</option>
        </select>
      </div>
    </div>

    <div v-if="paginatedPosts.length > 0" class="list-section container-card fade-up">
      <ul class="post-list">
        <li v-for="post in paginatedPosts" :key="post.id" class="post-item">
          <div class="post-card" @click="goToDetail(post.id)" role="button" tabindex="0">
            <div class="post-main">
              <h3>{{ post.title }}</h3>
              <div class="post-meta-head"><span class="post-author">{{ post.author || '익명' }}</span></div>
              <p class="post-content-preview">{{ truncateText(post.content, 120) }}</p>
              <div v-if="post.tags && post.tags.length" class="tags">{{ post.tags.map(t => `#${t}`).join(' ') }}</div>
            </div>
            <div class="post-meta">
              <div class="meta-info">
                <div class="meta-item"><strong>{{ post.viewCount || 0 }}</strong> 조회수</div>
                <div class="meta-item">{{ formatDate(post.createdAt) }}</div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-buttons">
          <button v-for="p in pages" :key="p" :class="{ 'active': p === currentPage }" @click="changePage(p)">{{ p }}</button>
        </div>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
      </div>
    </div>

    <div v-else class="empty-state container-card fade-up">
      <p>게시글이 없습니다.</p>
    </div>

    <!-- modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>새 게시글 작성</h2>
        <div class="warning-box"><p>⚠️ 로컬 프로토타입입니다. 비밀번호는 브라우저에 저장됩니다.</p></div>
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
              <input v-model="tagInput" @keydown.enter.prevent="addTag" type="text" placeholder="태그 입력 후 Enter" :disabled="form.tags.length >= 5" />
              <button type="button" @click="addTag" :disabled="form.tags.length >= 5">추가</button>
            </div>
            <div class="tag-list" v-if="form.tags.length > 0">
              <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">#{{ tag }} <button type="button" @click="removeTag(index)">×</button></span>
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
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { postService } from '../services/postService';

const router = useRouter();

const posts = ref(postService.getAllPosts() || []);
const searchQuery = ref('');
const debouncedSearchTerm = ref('');
let searchTimer = null;
const sortOrder = ref('latest');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredAndSortedPosts = computed(() => {
  let result = [...posts.value];
  const querySource = debouncedSearchTerm.value || '';
  if (querySource) {
    const q = querySource.toLowerCase();
    result = result.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))));
  }
  if (sortOrder.value === 'latest') result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOrder.value === 'views') result.sort((a,b) => (b.viewCount||0) - (a.viewCount||0));
  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedPosts.value.length / itemsPerPage)));
const paginatedPosts = computed(() => filteredAndSortedPosts.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));

const resetPage = () => { currentPage.value = 1; };
const clearSearch = () => { searchQuery.value=''; debouncedSearchTerm.value=''; resetPage(); };
const applyImmediateSearch = () => { if (searchTimer) clearTimeout(searchTimer); debouncedSearchTerm.value = searchQuery.value; resetPage(); };
watch(searchQuery, (v) => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(()=>{ debouncedSearchTerm.value = v; resetPage(); }, 300); });

const pages = computed(()=> { const arr=[]; for(let i=1;i<= totalPages.value;i++) arr.push(i); return arr; });

const changePage = (n)=>{ if(n>=1 && n<=totalPages.value){ currentPage.value = n; window.scrollTo({top:0, behavior:'smooth'}); } };
const goToDetail = (id) => { router.push(`/community/${id}`); };

// modal & form
const isModalOpen = ref(false);
const tagInput = ref('');
const getInitialForm = ()=>({ title:'', content:'', password:'', tags:[] });
const form = reactive(getInitialForm());
const openModal = ()=>{ isModalOpen.value = true; };
const closeModal = ()=>{ if (form.title||form.content) { if(!confirm('작성을 취소하시겠습니까?')) return; } isModalOpen.value=false; Object.assign(form, getInitialForm()); tagInput.value=''; };
const addTag = ()=>{ const v = tagInput.value.trim(); if(!v) return; if(form.tags.length>=5) return alert('태그는 최대 5개'); if(v.length>10) return alert('태그는 10자 이내'); if(!form.tags.includes(v)) form.tags.push(v); tagInput.value=''; };
const removeTag = (i)=> form.tags.splice(i,1);
const validateForm = ()=>{ if(form.title.trim().length<2||form.title.trim().length>60){ alert('제목을 2자 이상 입력해 주세요.'); return false;} if(form.content.trim().length<5||form.content.trim().length>2000){ alert('내용을 5자 이상 입력해 주세요.'); return false;} if(!/^[a-zA-Z0-9]{4,12}$/.test(form.password)){ alert('비밀번호를 4자 이상 입력해 주세요.'); return false;} return true; };
const submitPost = ()=>{ if(!validateForm()) return; const now = new Date().toISOString(); const newPost = { id:`post-${Date.now()}-${Math.random().toString(36).substr(2,4)}`, title:form.title.trim(), content:form.content.trim(), author:'익명', password:form.password, placeId:null, tags:[...form.tags], viewCount:0, likeCount:0, isBookmarked:false, imageDataUrl:null, createdAt:now, updatedAt:now }; postService.addPost(newPost); alert('게시글이 성공적으로 작성되었습니다.'); posts.value = postService.getAllPosts(); isModalOpen.value=false; Object.assign(form, getInitialForm()); resetPage(); };

const formatDate = (dateString)=>{ if(!dateString) return ''; const d=new Date(dateString); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}` };
const truncateText = (text, maxLength)=>{ if(!text) return ''; return text.length>maxLength? text.substring(0,maxLength)+'...' : text };
</script>

<style scoped>
/* Reuse community styles similar to CommunityView */
.hero-card{ display:grid; grid-template-columns:1fr auto; gap:24px; padding:36px; border-radius:var(--radius-lg); background:linear-gradient(135deg,var(--brand-2) 0%, var(--brand-1) 100%); color:var(--accent); box-shadow:var(--shadow-lg); }
.hero-card h1{ margin:0 0 6px; font-size:1.6rem }
.controls.container-card{ display:flex; gap:12px; align-items:center; }
.search-row{ display:flex; gap:10px; align-items:center; flex:1; background:var(--card-bg); padding:10px; border-radius:12px; box-shadow:0 8px 22px rgba(16,18,22,0.06) }
.sort-row{ margin-left:auto }
.list-section{ background:var(--card-bg); border-radius:18px; padding:20px; box-shadow:var(--shadow-md); border:1px solid rgba(120,88,60,0.08) }
.post-list{ list-style:none; padding:0; margin:0; display:grid; gap:12px }
.post-card{ display:flex; justify-content:space-between; gap:16px; align-items:flex-start; padding:16px; border-radius:12px; background:var(--card-bg); border:1px solid rgba(66,44,30,0.08); box-shadow:var(--shadow-md); color:var(--color-text) }
.tags{ margin-top:10px; color:var(--brand-2); background:rgba(247,235,220,0.9); padding:6px 10px; border-radius:999px; display:inline-block; font-weight:700 }
.pagination{ display:flex; gap:12px; align-items:center; margin-top:12px }
.page-buttons{ display:flex; gap:6px }
.page-buttons button{ padding:6px 10px; border-radius:8px; border:1px solid rgba(120,88,60,0.06); background:transparent }
.page-buttons button.active{ background:var(--brand-2); color:white; border-color:var(--brand-2) }
.post-author{ color:var(--muted); font-size:0.9rem; margin-right:8px }
.post-meta-head{ margin-bottom:8px; display:flex; gap:8px; align-items:center }
.empty-state{ text-align:center }
.btn-cancel{ background:transparent; border:1px solid rgba(120,88,60,0.08); padding:8px 12px; border-radius:999px }
</style>