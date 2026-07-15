<script setup>
import heroImage from '@/assets/images/running_man.png'
</script>

<template>
  <section class="home-shell">
    <div class="hero-card">
      <div class="hero-copy fade-up">
        <p class="eyebrow">LocalHub · 서울 레포츠 추천</p>
        <h1>
          원하는 지역에서
          <span>운동할 곳을 바로 찾아보세요</span>
        </h1>
        <p class="subtitle">
          서울 곳곳의 레포츠 장소를 탐색하고, 추천을 나누며,
          도장을 모아가며 나만의 활동 루트를 완성해보세요.
        </p>

        <div class="hero-actions">
          <RouterLink to="/places" class="primary-btn" aria-label="장소 둘러보기">장소 둘러보기</RouterLink>
          <RouterLink to="/community" class="ghost-btn" aria-label="커뮤니티 보기">커뮤니티 보기</RouterLink>
        </div>
      </div>

      <div class="hero-image" :style="{ backgroundImage: `url(${heroImage})` }">
        <div class="hero-image-overlay"></div>
        <div class="hero-stats">
          <div>
            <p>추천 장소</p>
            <strong>서울 전역</strong>
          </div>
          <div>
            <p>챗봇 추천</p>
            <strong>맞춤 검색</strong>
          </div>
          <div>
            <p>도장 기능</p>
            <strong>기록 관리</strong>
          </div>
        </div>
      </div>
    </div>

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
  </section>
</template>

<style scoped>
.home-shell {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px 16px 48px;
  max-width: 1100px;
  margin: 0 auto;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 24px;
  padding: 36px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand-1) 100%);
  color: var(--accent);
  box-shadow: var(--shadow-lg);
}

.hero-copy h1 {
  margin: 0 0 14px;
  font-size: clamp(1.9rem, 3.2vw, 2.8rem);
  line-height: 1.15;
}

.hero-copy h1 span {
  display: block;
  color: var(--accent);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240,211,170,0.95);
}

.subtitle {
  margin: 0 0 22px;
  max-width: 640px;
  color: rgba(255,247,239,0.95);
  font-size: 1rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-btn,
.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border-radius: 999px;
  font-weight: 800;
  transition: transform var(--transition-default), box-shadow var(--transition-default);
  text-decoration: none;
}

.primary-btn {
  background: var(--card-bg);
  color: var(--brand-2);
  box-shadow: 0 8px 22px rgba(16,18,22,0.12);
}

.ghost-btn {
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,247,239,0.95);
  background: transparent;
}

.primary-btn:hover,
.ghost-btn:hover,
.feature-card:hover {
  transform: translateY(-4px);
}

.primary-btn:focus-visible,
.ghost-btn:focus-visible,
.feature-card:focus-visible {
  outline: 3px solid rgba(255,227,184,0.22);
  outline-offset: 4px;
}

.hero-image {
  position: relative;
  min-height: 380px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 2000px rgba(16, 24, 40, 0.22);
}

.hero-image-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 30%),
    linear-gradient(180deg, rgba(0,0,0,0.04), rgba(12,18,35,0.58) 100%);
}

.hero-stats {
  position: absolute;
  left: 20px;
  bottom: 20px;
  right: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-stats div {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
}

.hero-stats p {
  margin: 0 0 6px;
  font-size: 0.82rem;
  opacity: 0.94;
}

.hero-stats strong {
  font-size: 1rem;
  display: block;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  display: block;
  padding: 20px;
  border-radius: 18px;
  background: var(--glass);
  border: 1px solid rgba(120,88,60,0.08);
  box-shadow: var(--shadow-md);
  color: #433120;
  transition: transform var(--transition-default), box-shadow var(--transition-default);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #f7ebdc;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1.06rem;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.bottom-section {
  padding: 24px 28px;
  border-radius: 20px;
  background: var(--glass);
  border: 1px solid rgba(120,88,60,0.08);
}

.section-title h2 {
  margin: 0;
  color: #34241b;
  font-size: 1.35rem;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.info-item {
  padding: 16px;
  border-radius: 12px;
  background: #faf4eb;
}

.info-item strong {
  display: block;
  margin-bottom: 6px;
  color: var(--brand-2);
}

.info-item p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

/* Subtle entrance animation */
.fade-up {
  animation: fadeUp 520ms var(--transition-default) both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Staggered appearance for feature cards */
.feature-card:nth-child(1) { animation: fadeUp 560ms var(--transition-default) both; }
.feature-card:nth-child(2) { animation: fadeUp 680ms var(--transition-default) both; }
.feature-card:nth-child(3) { animation: fadeUp 800ms var(--transition-default) both; }

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .feature-grid,
  .info-list {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .hero-image {
    min-height: 280px;
  }
}
</style>