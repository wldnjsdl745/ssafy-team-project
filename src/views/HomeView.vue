<script setup>
import { ref, onMounted } from 'vue'
import heroImage from '@/assets/images/running_man.png'
import { postService } from '../servies/postService' // 경로 확인 필요

// 최신 게시글 상태 관리
const recentPosts = ref([])

onMounted(() => {
  // 전체 게시글을 가져와서 최신순으로 정렬한 뒤 상위 3개만 자릅니다.
  const allPosts = postService.getAllPosts() || []
  recentPosts.value = allPosts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
})

// 날짜 포맷 유틸
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <section class="home-shell">
    <article class="hero-panel" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="hero-overlay"></div>
      <div class="hero-copy fade-up">
        <p class="eyebrow">LocalHub · 서울 레포츠 추천</p>
        <h1>
          <span class="hero-heading-line">
            원하는 지역<span class="hero-highlight">에서</span>
          </span>
          <span class="hero-heading-line hero-highlight">운동할 곳을 바로 찾아보세요</span>
        </h1>
        <p class="subtitle">
          서울 곳곳의 레포츠 장소를 탐색하고, 추천을 나누며, 도장을 모아가며 나만의 활동 루트를 완성해보세요.
        </p>

        <div class="hero-actions">
          <RouterLink to="/places" class="primary-btn" aria-label="장소 둘러보기">장소 둘러보기</RouterLink>
          <RouterLink to="/community" class="ghost-btn" aria-label="커뮤니티 보기">커뮤니티 보기</RouterLink>
        </div>
      </div>
    </article>

    <div class="feature-grid">
      <RouterLink to="/places" class="feature-card">
        <div class="feature-icon">📍</div>
        <h3>서울 레포츠 장소 탐색</h3>
        <p>구별로 필터링하고, 사진과 주소를 확인해 쉽게 찾을 수 있어요.</p>
      </RouterLink>

      <RouterLink to="/community" class="feature-card">
        <div class="feature-icon">💬</div>
        <h3>추천 공유와 소통</h3>
        <p>다른 사람들의 후기를 보고, 나만의 운동 루트를 공유해보세요.</p>
      </RouterLink>

      <RouterLink to="/stamp" class="feature-card">
        <div class="feature-icon">🏁</div>
        <h3>도장 깨기 미션</h3>
        <p>방문한 장소를 기록하며 작은 목표를 달성해보세요.</p>
      </RouterLink>
    </div>

    <div class="bottom-section">
      <div class="section-title">
        <p class="eyebrow">Why LocalHub</p>
        <h2>서울에서 운동하기 좋은 장소를, 더 가볍게</h2>
      </div>

      <div class="info-list">
        <div class="info-item">
          <strong>빠른 탐색</strong>
          <p>원하는 구를 선택하면 관련 장소를 바로 확인할 수 있어요.</p>
        </div>
        <div class="info-item">
          <strong>실사용형 추천</strong>
          <p>챗봇으로 지역을 말하면 그에 맞는 장소를 추천받아볼 수 있어요.</p>
        </div>
        <div class="info-item">
          <strong>함께 만드는 경험</strong>
          <p>커뮤니티와 도장 기능으로 운동 경험을 기록하고 공유해요.</p>
        </div>
      </div>
    </div>

    <div class="recent-posts-section">
      <div class="section-title-flex">
        <div>
          <p class="eyebrow">Community</p>
          <h2>최근 올라온 게시글</h2>
        </div>
        <RouterLink to="/community" class="view-all-link">전체보기 →</RouterLink>
      </div>

      <div v-if="recentPosts.length > 0" class="recent-post-grid">
        <RouterLink 
          v-for="post in recentPosts" 
          :key="post.id" 
          :to="`/community/${post.id}`"
          class="recent-post-card"
        >
          <h3>{{ post.title }}</h3>
          <p class="post-preview">{{ post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content }}</p>
          <div class="post-meta">
            <span class="meta-item">👀 {{ post.viewCount || 0 }}</span>
            <span class="meta-item">❤️ {{ post.likeCount || 0 }}</span>
            <span class="meta-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </RouterLink>
      </div>
      
      <div v-else class="empty-state">
        <p>아직 작성된 게시글이 없습니다. 첫 번째 글을 남겨보세요!</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- 1. 기본 레이아웃 및 기존 스타일 --- */
.home-shell {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 0 16px 56px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-panel {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  padding: 60px 32px;
  border-radius: 32px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(18, 30, 55, 0.36), rgba(10, 14, 24, 0.88));
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 980px;
  color: #fff;
}

.hero-copy h1 {
  margin: 0 0 18px;
  font-size: clamp(3rem, 6vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-heading-line {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 100%;
}

.hero-highlight {
  color: #ffe2a2;
}

.hero-copy h1 span {
  display: inline;
}

.eyebrow {
  margin: 0 0 16px;
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.subtitle {
  margin: 0 0 28px;
  max-width: 980px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
  line-height: 1.65;
  white-space: normal;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.primary-btn,
.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 26px;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.primary-btn {
  background: #ffebc7;
  color: #3b2219;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.12);
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.primary-btn:hover,
.ghost-btn:hover,
.feature-card:hover,
.recent-post-card:hover {
  transform: translateY(-4px);
}

.primary-btn:focus-visible,
.ghost-btn:focus-visible,
.feature-card:focus-visible,
.recent-post-card:focus-visible {
  outline: 3px solid rgba(255, 227, 184, 0.22);
  outline-offset: 4px;
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  border-radius: 28px;
  background: #ffffff;
  color: #1c1e24;
  box-shadow: 0 18px 40px rgba(20, 32, 64, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease;
  text-decoration: none;
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #f7ebdc;
  font-size: 1.8rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1.06rem;
}

.feature-card p {
  margin: 0;
  color: #647381;
  line-height: 1.6;
}

/* Bottom Section */
.bottom-section,
.recent-posts-section {
  padding: 24px 28px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(120,88,60,0.08);
  /* ⭐️ 동일한 그림자 효과 추가 */
  box-shadow: 0 18px 40px rgba(20, 32, 64, 0.08);
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.section-title h2 {
  margin: 0;
  font-size: clamp(2rem, 3.2vw, 2.8rem);
  line-height: 1.1;
  color: #34241b;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-top: 16px;
}

.info-item {
  padding: 26px;
  border-radius: 24px;
  background: #fff8f1;
  border: 1px solid rgba(240, 211, 170, 0.28);
}

.info-item strong {
  display: block;
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: #b86b25;
}

.info-item p {
  margin: 0;
  color: #4f4b45;
  line-height: 1.7;
}

/* --- ⭐️ 2. 추가된 최신 게시글 스타일 (미디어 쿼리 밖으로 빼냄) --- */
.recent-posts-section {
  padding: 24px 28px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(120,88,60,0.08);
}

.section-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}

.section-title-flex h2 {
  margin: 0;
  color: #34241b;
  font-size: 1.35rem;
}

.view-all-link {
  font-size: 0.9rem;
  color: #b86b25;
  font-weight: 600;
  text-decoration: none;
  padding-bottom: 4px;
}

.view-all-link:hover {
  text-decoration: underline;
}

.recent-post-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.recent-post-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #eee;
  text-decoration: none;
  color: inherit;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.recent-post-card h3 {
  margin: 0 0 10px;
  font-size: 1.1rem;
  color: #24313d;
}

.post-preview {
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: #647381;
  line-height: 1.5;
  flex-grow: 1;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #8c98a4;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.meta-date {
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #faf4eb;
  border-radius: 12px;
  color: #647381;
  font-size: 0.95rem;
}

/* --- 3. 애니메이션 --- */
.fade-up {
  animation: fadeUp 520ms ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.feature-card:nth-child(1) { animation: fadeUp 560ms ease-out both; }
.feature-card:nth-child(2) { animation: fadeUp 680ms ease-out both; }
.feature-card:nth-child(3) { animation: fadeUp 800ms ease-out both; }

/* --- 4. 반응형 미디어 쿼리 (가장 아래에 한 번만 선언) --- */
@media (max-width: 900px) {
  .hero-card,
  .hero-panel {
    grid-template-columns: 1fr;
    padding: 48px 22px;
    min-height: 75vh;
  }

  .feature-grid,
  .info-list,
  .recent-post-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .hero-image {
    min-height: 280px;
  }
}

@media (max-width: 860px) {
  .hero-copy h1 {
    font-size: clamp(2.8rem, 7vw, 3.6rem);
  }
}

@media (max-width: 640px) {
  .home-shell {
    padding: 0 14px 42px;
  }

  .hero-panel {
    min-height: 68vh;
    padding: 34px 18px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-btn,
  .ghost-btn {
    width: 100%;
  }
}
</style>