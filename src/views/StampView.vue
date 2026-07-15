<template>
  <section class="stamp-page page-shell">
    <!-- ===== HERO ===== -->
    <header class="hero-card fade-up">
      <div class="hero-copy">
        <p class="eyebrow">서울시 자치구</p>
        <h1>도장 깨기 현황</h1>
        <p class="subtitle">서울시 25개 구를 달리며 방문 기록을 채워보세요.</p>
      </div>

      <div class="hero-progress">
        <div class="progress-head">
          <strong>{{ visitedCount }}</strong><span>/ 25 구</span>
        </div>
        <div class="progress-track" role="progressbar" :aria-valuenow="visitedCount" aria-valuemin="0" aria-valuemax="25">
          <div class="progress-fill" :style="{ width: `${(visitedCount / 25) * 100}%` }"></div>
        </div>
        <p class="progress-sub">총 {{ totalStamps }}회 방문 · {{ 25 - visitedCount }}개 구 남음</p>
      </div>
    </header>

    <!-- ===== 차트 ===== -->
    <div class="board-card fade-up">
      <div class="board-head">
        <div>
          <h2>방문 지도</h2>
          <p class="board-hint">버블을 누르면 방문 1회가 기록돼요.</p>
        </div>
        <button type="button" class="btn-ghost" @click="resetAll" :disabled="totalStamps === 0">전체 초기화</button>
      </div>

      <div class="chart-wrapper">
        <canvas ref="chartCanvas" aria-label="자치구별 방문 횟수 버블 차트"></canvas>
      </div>

      <!-- 색상 범례 — 6단계 색이 뭘 의미하는지 알 방법이 없었음 -->
      <ul class="legend">
        <li v-for="tier in TIERS" :key="tier.label">
          <span class="legend-dot" :style="{ background: tier.fill, borderColor: tier.border }"></span>
          {{ tier.label }}
        </li>
      </ul>
    </div>

    <!-- ===== 입력 ===== -->
    <div class="input-card-wrap fade-up">
      <div class="board-head">
        <div>
          <h2>기록 수정</h2>
          <p class="board-hint">숫자를 직접 고치거나 +/− 로 조절하세요.</p>
        </div>
      </div>

      <div class="input-grid">
        <div
          v-for="gu in districts"
          :key="gu.name"
          class="input-card"
          :class="{ 'is-visited': gu.visits > 0, 'is-focus': focusedName === gu.name }"
        >
          <label :for="`gu-${gu.name}`">{{ gu.name }}</label>
          <div class="stepper">
            <button type="button" @click="step(gu, -1)" :disabled="gu.visits <= 0" :aria-label="`${gu.name} 1회 빼기`">−</button>
            <input
              :id="`gu-${gu.name}`"
              type="number"
              inputmode="numeric"
              v-model.number="gu.visits"
              @input="onInput(gu)"
              min="0"
              max="50"
              placeholder="0"
            />
            <button type="button" @click="step(gu, 1)" :disabled="gu.visits >= 50" :aria-label="`${gu.name} 1회 더하기`">+</button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const STORAGE_KEY = 'stampRallyData';

const districts = ref([
  { name: '강남', visits: 0 }, { name: '강동', visits: 0 }, { name: '강북', visits: 0 },
  { name: '강서', visits: 0 }, { name: '관악', visits: 0 }, { name: '광진', visits: 0 },
  { name: '구로', visits: 0 }, { name: '금천', visits: 0 }, { name: '노원', visits: 0 },
  { name: '도봉', visits: 0 }, { name: '동대문', visits: 0 }, { name: '동작', visits: 0 },
  { name: '마포', visits: 0 }, { name: '서대문', visits: 0 }, { name: '서초', visits: 0 },
  { name: '성동', visits: 0 }, { name: '성북', visits: 0 }, { name: '송파', visits: 0 },
  { name: '양천', visits: 0 }, { name: '영등포', visits: 0 }, { name: '용산', visits: 0 },
  { name: '은평', visits: 0 }, { name: '종로', visits: 0 }, { name: '중구', visits: 0 },
  { name: '중랑', visits: 0 }
]);

const chartCanvas = ref(null);
const focusedName = ref('');
let myChart = null;

// --- 브랜드 톤 단계 (기존 블루/그린 팔레트 → 웜톤) ---
const TIERS = [
  { min: 0,  label: '미방문',  fill: 'rgba(120, 88, 60, 0.12)', border: 'rgba(120, 88, 60, 0.35)', text: '#8A6A4B' },
  { min: 1,  label: '1–2회',   fill: '#EBD3AE', border: '#FFF7EF', text: '#5A3A1C' },
  { min: 3,  label: '3–6회',   fill: '#DFA867', border: '#FFF7EF', text: '#4A2E12' },
  { min: 7,  label: '7–11회',  fill: '#CE7F35', border: '#FFF7EF', text: '#FFF7EF' },
  { min: 12, label: '12–19회', fill: '#A9541D', border: '#FFF7EF', text: '#FFF7EF' },
  { min: 20, label: '20회+',   fill: '#7C3211', border: '#FFF7EF', text: '#FFF7EF' }
];
const tierOf = (v) => TIERS.slice().reverse().find(t => (v || 0) >= t.min);

const visitedCount = computed(() => districts.value.filter(d => d.visits > 0).length);
const totalStamps = computed(() => districts.value.reduce((s, d) => s + (d.visits || 0), 0));

// --- 토스트 ---
const toast = ref('');
let toastTimer = null;
const showToast = (msg) => {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ''; }, 1800);
};

// --- 저장 / 불러오기 ---
// 저장본으로 배열을 통째로 갈아끼우면 구 목록이 바뀔 때 깨지므로 이름 기준으로 병합
const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return;
    const map = new Map(saved.map(d => [d.name, Number(d.visits) || 0]));
    districts.value.forEach(d => { if (map.has(d.name)) d.visits = map.get(d.name); });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(districts.value));
  } catch { /* 저장 공간 초과 시 화면 동작은 유지 */ }
};

// --- 차트 ---
const LABEL_INSIDE_R = 24; // 이 이상이면 버블 안, 미만이면 버블 밖에 라벨
const radiusOf = (visits) => 13 + Math.min(visits || 0, 20) * 0.95;

const generateChartData = () => ({
  datasets: [{
    data: districts.value.map((d, i) => ({
      x: i % 5,
      y: Math.floor(i / 5),
      r: radiusOf(d.visits),
      visitCount: d.visits || 0,
      name: d.name
    })),
    backgroundColor: districts.value.map(d => tierOf(d.visits).fill),
    borderColor: districts.value.map(d => tierOf(d.visits).border),
    borderWidth: 2,
    hoverBorderWidth: 3,
    hoverBorderColor: '#7C3211'
  }]
});

const updateChart = () => {
  save();
  if (!myChart) return;
  myChart.data = generateChartData();
  myChart.update('none');
};

const step = (gu, delta) => {
  gu.visits = Math.min(50, Math.max(0, (gu.visits || 0) + delta));
  updateChart();
};

const onInput = (gu) => {
  if (gu.visits === '' || gu.visits === null) return; // 지우는 중에는 건드리지 않음
  gu.visits = Math.min(50, Math.max(0, Math.floor(Number(gu.visits) || 0)));
  updateChart();
};

const resetAll = () => {
  if (!confirm('모든 방문 기록을 지웁니다. 되돌릴 수 없어요.')) return;
  districts.value.forEach(d => { d.visits = 0; });
  updateChart();
  showToast('기록을 모두 지웠어요');
};

onMounted(async () => {
  loadSaved();
  await nextTick();

  myChart = new Chart(chartCanvas.value.getContext('2d'), {
    type: 'bubble',
    data: generateChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 28 },
      onHover: (e, els) => {
        e.native.target.style.cursor = els.length ? 'pointer' : 'default';
        focusedName.value = els.length ? districts.value[els[0].index].name : '';
      },
      // 버블 자체가 도장 — 누르면 찍힘
      onClick: (e, els) => {
        if (!els.length) return;
        const gu = districts.value[els[0].index];
        step(gu, 1);
        showToast(`${gu.name}구 ${gu.visits}회째 방문`);
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(56, 33, 15, 0.92)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            title: (items) => `${items[0].raw.name}구`,
            label: (item) => item.raw.visitCount > 0 ? `방문 ${item.raw.visitCount}회` : '아직 안 갔어요'
          }
        },
        datalabels: {
          formatter: (v) => v.name,
          font: { size: 11, weight: 'bold', family: 'Pretendard, sans-serif' },
          // 버블 밖으로 나가는 라벨은 카드 배경 위에 놓이므로 항상 진한 색
          color: (ctx) => {
            const p = ctx.dataset.data[ctx.dataIndex];
            return p.r >= LABEL_INSIDE_R ? tierOf(p.visitCount).text : '#5A3A1C';
          },
          anchor: 'center',
          align: (ctx) => ctx.dataset.data[ctx.dataIndex].r >= LABEL_INSIDE_R ? 'center' : 'bottom',
          offset: (ctx) => {
            const p = ctx.dataset.data[ctx.dataIndex];
            return p.r >= LABEL_INSIDE_R ? 0 : p.r + 3;
          },
          clamp: true,
          display: 'auto'
        }
      },
      scales: {
        x: { display: false, min: -0.6, max: 4.6 },
        y: { display: false, min: -0.6, max: 4.6, reverse: true }
      },
      interaction: { mode: 'point', intersect: true },
      animation: { duration: 700, easing: 'easeOutQuart' }
    }
  });
});

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
  myChart?.destroy(); // 라우트 이동 시 캔버스 누수 방지
  myChart = null;
});
</script>

<style scoped>
/* page-shell의 배경·폭을 그대로 쓰고, 자체 배경/폰트 재정의는 제거 */
.stamp-page { display: flex; flex-direction: column; gap: 20px; }

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

/* 뱃지 하나로 "12/25"만 보여주던 자리를 진행률로 */
.hero-progress { min-width: 220px; }
.progress-head { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
.progress-head strong { font-size: 2rem; font-weight: 800; line-height: 1; }
.progress-head span { font-size: 0.9rem; color: rgba(255, 247, 239, 0.7); }
.progress-track {
  height: 8px; border-radius: 999px;
  background: rgba(255, 247, 239, 0.2);
  overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 999px;
  background: var(--accent);
  transition: width 0.4s ease;
}
.progress-sub { margin: 8px 0 0; font-size: 0.78rem; color: rgba(255, 247, 239, 0.7); }

/* ---------- 카드 공통 ---------- */
.board-card, .input-card-wrap {
  padding: 22px;
  background: var(--card-bg);
  border: 1px solid rgba(120, 88, 60, 0.1);
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(56, 33, 15, 0.05);
}
.board-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
  margin-bottom: 4px;
}
.board-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--color-text); }
.board-hint { margin: 4px 0 0; font-size: 0.82rem; color: var(--muted); }

.btn-ghost {
  padding: 8px 14px;
  border: 1px solid rgba(120, 88, 60, 0.16); border-radius: 999px;
  background: none; color: var(--muted);
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: color var(--transition-default), border-color var(--transition-default);
}
.btn-ghost:hover:not(:disabled) { color: #c0392b; border-color: rgba(192, 57, 43, 0.4); }
.btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

.chart-wrapper { width: 100%; height: 460px; position: relative; }

/* ---------- 범례 ---------- */
.legend {
  list-style: none; display: flex; flex-wrap: wrap; gap: 6px;
  padding: 14px 0 0; margin: 0;
  border-top: 1px dashed rgba(120, 88, 60, 0.16);
}
.legend li {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  background: rgba(247, 235, 220, 0.5);
  font-size: 0.75rem; font-weight: 600; color: var(--muted);
}
.legend-dot { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid; }

/* ---------- 입력 그리드 ---------- */
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.input-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(250, 246, 239, 0.7);
  border: 1px solid transparent;
  transition: border-color var(--transition-default), background var(--transition-default), transform var(--transition-default);
}
.input-card:hover { transform: translateY(-2px); background: var(--card-bg); border-color: rgba(120, 88, 60, 0.16); }
.input-card.is-visited { background: rgba(247, 235, 220, 0.85); }
.input-card.is-focus { border-color: var(--brand-2); background: var(--card-bg); } /* 차트 hover와 연동 */
.input-card label { font-weight: 700; font-size: 0.9rem; color: var(--color-text); }

/* number 입력만 두면 모바일에서 조작이 힘들어 스테퍼 추가 */
.stepper {
  display: flex; align-items: center; width: 100%;
  border: 1px solid rgba(120, 88, 60, 0.18); border-radius: 10px;
  background: var(--card-bg);
  overflow: hidden;
}
.stepper button {
  width: 32px; height: 36px; flex-shrink: 0;
  border: none; background: none;
  color: var(--brand-2); font-size: 1.1rem; font-weight: 700; cursor: pointer;
}
.stepper button:hover:not(:disabled) { background: rgba(247, 235, 220, 0.9); }
.stepper button:disabled { opacity: 0.3; cursor: not-allowed; }
.stepper input {
  flex: 1; min-width: 0; width: 100%; height: 36px;
  border: none; background: transparent;
  text-align: center;
  font: inherit; font-size: 1rem; font-weight: 700;
  color: var(--brand-2);
  font-variant-numeric: tabular-nums;
}
.stepper input:focus { outline: none; }
.stepper:focus-within { border-color: var(--brand-2); box-shadow: 0 0 0 3px rgba(120, 88, 60, 0.1); }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; appearance: textfield; }

/* ---------- 토스트 ---------- */
.toast {
  position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%);
  padding: 12px 22px; border-radius: 999px;
  background: var(--brand-2); color: var(--accent);
  font-size: 0.88rem; font-weight: 600;
  box-shadow: var(--shadow-lg); z-index: 1100;
}
.toast-enter-active, .toast-leave-active { transition: opacity 0.24s, transform 0.24s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }

/* ---------- 반응형 ---------- */
@media (max-width: 900px) {
  .hero-card { grid-template-columns: 1fr; padding: 24px; }
  .hero-progress { min-width: 0; width: 100%; }
  .board-card, .input-card-wrap { padding: 16px; }
  .chart-wrapper { height: 340px; }
  .input-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .input-card, .progress-fill, .toast-enter-active, .toast-leave-active { transition: none; }
  .input-card:hover { transform: none; }
}
</style>