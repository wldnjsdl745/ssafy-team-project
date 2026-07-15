<template>
  <section class="place-page">
    <div class="hero-card">
      <div>
        <p class="eyebrow">서울 레포츠 추천</p>
        <h1>원하는 지역을 선택해 나만의 운동 장소를 찾아보세요</h1>
        <p class="subtitle">
          쉽고 빠르게 탐색할 수 있어요.
        </p>
      </div>

      <div class="hero-badge">
        <span>{{ places.length }}개 장소</span>
      </div>
    </div>

    <div class="controls-card">
      <label for="district">구 선택</label>
      <select id="district" v-model="selectedDistrict">
        <option value="">전체 보기</option>
        <option v-for="d in districts" :key="d" :value="d">
          {{ d }}
        </option>
      </select>
    </div>

    <div class="content-row">
      <div class="list-section">
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
    '중랑구': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
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
.place-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
  border-radius: 28px;
  color: #0f172a;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
  color: white;
  padding: 28px 30px;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.86;
}

.hero-card h1 {
  margin: 0 0 10px;
  font-size: 1.6rem;
  line-height: 1.3;
}

.subtitle {
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
  max-width: 620px;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.16);
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.controls-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 18px;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.controls-card label {
  font-weight: 800;
  color: #334155;
}

.controls-card select {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 190px;
  outline: none;
  background: white;
  color: #0f172a;
  font-weight: 600;
}
.content-row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 20px;
  align-items: start;
}
.list-section {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.place-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}

.place-item {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.place-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.08);
}

.thumb {
  width: 120px;
  height: 84px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.tag-row {
  margin-bottom: 7px;
}

.district-tag {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 999px;
  background: #e0edff;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 800;
}

.info h3 {
  margin: 0 0 6px;
  font-size: 1.02rem;
  color: #0f172a;
  font-weight: 800;
}

.addr {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.empty-state {
  padding: 34px 12px;
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.chatbot-wrap {
  margin-top: 4px;
  position: sticky;
  top: 20px;
}

:deep(.chatbot) {
  margin-top: 0;
  max-width: 100%;
  min-height: 480px;
}

@media (max-width: 768px) {
  .place-page {
    padding: 18px;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 22px;
  }

  .controls-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .controls-card select {
    width: 100%;
    min-width: 0;
  }

  .place-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .thumb {
    width: 100%;
    height: 150px;
  }
}
</style>
