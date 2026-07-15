<template>
  <section>
    <h1>서울 레포츠 장소 목록</h1>

    <div class="controls">
      <label for="district">구 선택:</label>
      <select id="district" v-model="selectedDistrict">
        <option value="">전체</option>
        <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div class="list">
      <div v-if="filteredPlaces.length === 0">검색 결과가 없습니다.</div>
      <ul>
        <li v-for="place in filteredPlaces" :key="place.contentid" class="place-item">
          <img v-if="place.firstimage" :src="place.firstimage" alt="이미지" class="thumb" />
          <div class="info">
            <h3>{{ place.title }}</h3>
            <p class="addr">{{ place.addr1 }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import placesData from '../../data/서울_레포츠.json'

const places = ref(placesData.items || [])
const selectedDistrict = ref('')

// Extract district (구) from addr1, e.g. '서울특별시 종로구 ...' -> '종로구'
function extractDistrict(addr = '') {
  const m = addr.match(/서울\s*특별시\s*([^\s,()]+구)/)
  if (m && m[1]) return m[1]
  // fallback: try to find token that ends with '구'
  const toks = addr.split(/\s+/)
  for (const t of toks) if (t.endsWith('구')) return t
  return ''
}

const districts = computed(() => {
  const set = new Set()
  for (const p of places.value) {
    const d = extractDistrict(p.addr1)
    if (d) set.add(d)
  }
  return Array.from(set).sort()
})

const filteredPlaces = computed(() => {
  if (!selectedDistrict.value) return places.value
  return places.value.filter(p => extractDistrict(p.addr1) === selectedDistrict.value)
})
</script>

<style scoped>
.controls { margin: 12px 0; }
.list ul { list-style: none; padding: 0; }
.place-item { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
.thumb { width: 120px; height: 80px; object-fit: cover; border-radius: 6px; }
.info h3 { margin: 0 0 6px 0; }
.addr { margin: 0; color: #666; font-size: 0.9rem; }
</style>
