<template>
  <section class="place-page page-shell">
    <div class="hero-card fade-up">
      <div>
        <p class="eyebrow">서울 레포츠 추천</p>
        <h1>원하는 지역을 선택해 나만의 운동 장소를 찾아보세요</h1>
        <p class="subtitle">쉽고 빠르게 탐색할 수 있어요.</p>
      </div>

      <div class="hero-badge">
        <span>{{ places.length }}개 장소</span>
      </div>
    </div>

    <div class="controls-card container-card fade-up">
      <label for="district">구 선택</label>
      <select id="district" v-model="selectedDistrict">
        <option value="">전체 보기</option>
        <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div class="content-row">
      <div class="list-section container-card fade-up">
        <div v-if="filteredPlaces.length === 0" class="empty-state">
          <p>해당 구의 장소가 아직 없습니다.</p>
        </div>

        <ul v-else class="place-list">
          <li v-for="place in filteredPlaces" :key="place.contentid" class="place-item">
            <img :src="getPlaceImage(place)" alt="장소 이미지" class="thumb" />
            <div class="info">
              <div class="tag-row">
                <span class="district-tag">{{ extractDistrict(place.addr1) || '서울' }}</span>
              </div>
              <h3>{{ place.title }}</h3>
              <p class="addr">{{ place.addr1 }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="chatbot-wrap">
        <Chatbot />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Chatbot from '../components/chatbot/Chatbot.vue'

const places = ref([])
const selectedDistrict = ref('')

onMounted(async () => {
  try {
    const response = await fetch('/data/서울_레포츠.json')
    const data = await response.json()
    places.value = Array.isArray(data) ? data : data.items || []
  } catch (error) {
    console.error('장소 데이터 로딩 실패:', error)
  }
})

function extractDistrict(addr = '') {
  const m = addr.match(/서울(?:특별시)?\s*([^\s,()]+구)/)
  if (m && m[1]) return m[1]

  const tokens = addr.split(/\s+/)
  for (const token of tokens) {
    if (token.endsWith('구')) return token
  }

  return ''
}

function getPlaceImage(place) {
  if (place.firstimage) return place.firstimage

  const district = extractDistrict(place.addr1)
  const fallbackMap = {
    '강남구': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    '강동구': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    '강북구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    '강서구': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    '관악구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    '광진구': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    '구로구': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    '금천구': 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    '노원구': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    '도봉구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    '동대문구': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    '동작구': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    '마포구': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
    '서대문구': 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    '서초구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    '성동구': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    '성북구': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    '송파구': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    '양천구': 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    '영등포구': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    '용산구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    '은평구': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    '종로구': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    '중구': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    '중랑구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
  }

  return fallbackMap[district] || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80'
}

const districts = computed(() => {
  const set = new Set()
  for (const place of places.value) {
    const district = extractDistrict(place.addr1)
    if (district) set.add(district)
  }
  return Array.from(set).sort()
})

const filteredPlaces = computed(() => {
  if (!selectedDistrict.value) return places.value
  return places.value.filter(place => extractDistrict(place.addr1) === selectedDistrict.value)
})
</script>

<style scoped>
.place-page { display:flex; flex-direction:column; gap:20px; padding:0; background:transparent; color:var(--color-text); }
.hero-card { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, var(--brand-2) 0%, var(--brand-1) 100%); color:var(--accent); padding:36px; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); }
.eyebrow { margin:0 0 8px; font-size:0.82rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:rgba(240,211,170,0.95); }
.hero-badge { background:rgba(255,255,255,0.12); padding:10px 14px; border-radius:999px; font-weight:800; color:var(--card-bg); }
.controls-card { display:flex; align-items:center; gap:14px; background:var(--glass); padding:14px 16px; border-radius:14px; box-shadow:var(--shadow-md); border:1px solid rgba(120,88,60,0.06); }
.controls-card label { font-weight:800; color:var(--brand-2); }
.controls-card select { border:1px solid rgba(120,88,60,0.08); border-radius:12px; padding:10px 12px; min-width:180px; outline:none; background:var(--card-bg); color:var(--color-text); font-weight:700; }
.content-row { display:grid; grid-template-columns:1.4fr 0.9fr; gap:20px; align-items:start; }
.list-section { background:var(--glass); border-radius:18px; padding:18px; box-shadow:var(--shadow-md); border:1px solid rgba(120,88,60,0.06); }
.place-list { list-style:none; padding:0; margin:0; display:grid; gap:14px; }
.place-item { display:flex; gap:16px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,246,239,0.95) 100%); transition:transform var(--transition-default), box-shadow var(--transition-default); border:1px solid rgba(120,88,60,0.06); }
.place-item:hover { transform:translateY(-6px); box-shadow:var(--shadow-md); }
.thumb { width:120px; height:84px; object-fit:cover; border-radius:12px; flex-shrink:0; }
.info { flex:1; }
.tag-row { margin-bottom:8px; }
.district-tag { display:inline-block; padding:6px 10px; border-radius:999px; background:var(--accent); color:var(--brand-2); font-size:0.8rem; font-weight:800; }
.info h3 { margin:0 0 6px; font-size:1.02rem; color:var(--color-text); font-weight:800; }
.addr { margin:0; color:var(--muted); font-size:0.95rem; line-height:1.5; }
.empty-state { padding:32px 12px; text-align:center; color:var(--muted); font-weight:700; }
.chatbot-wrap { margin-top:4px; position:sticky; top:20px; }
:deep(.chatbot) { margin-top:0; max-width:100%; min-height:420px; }
@media (max-width:900px) {
  .content-row { grid-template-columns:1fr; }
  .thumb { width:100%; height:160px; }
  .hero-card { padding:20px; }
  .controls-card { flex-direction:column; align-items:flex-start; }
}
</style>