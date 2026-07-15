<template>
  <section class="place-page stamp-rally">
    <!-- Header Section (디자인 통일) -->
    <header class="hero-card page-header">
      <div>
        <p class="eyebrow">서울시 자치구</p>
        <h1>도장 깨기 현황</h1>
        <p class="subtitle">서울시 25개 구를 달리며 방문 기록을 채워보세요!</p>
      </div>
      <div class="hero-badge">
        <span>{{ totalVisits }} / 25 구</span>
      </div>
    </header>

    <!-- Main Chart Section (세련된 버블 차트) -->
    <div class="dashboard-card content-row list-section">
      <div class="chart-wrapper">
        <canvas id="stampChart"></canvas>
      </div>
    </div>

    <!-- Stats Input Section (카드형 그리드) -->
    <div class="input-grid controls-card">
      <div v-for="(gu, index) in districts" :key="gu.name" class="input-card">
        <label>{{ gu.name }}</label>
        <input
          type="number"
          v-model.number="gu.visits"
          @input="updateChart"
          min="0"
          max="50"
          placeholder="0"
          class="stylish-input"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

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

let myChart = null;

// 총 방문 횟수 계산 (헤더 배지에 표시)
const totalVisits = computed(() => {
  return districts.value.filter(d => d.visits > 0).length;
});

// 세련된 반투명 컬러 팔레트 (두 번째 디자인의 블루/그린 톤 활용)
const getColor = (visits) => {
  if (visits === 0) return 'rgba(203, 213, 225, 0.4)'; // #cbd5e1 (light slate)
  if (visits < 3) return 'rgba(56, 189, 248, 0.6)';  // #38bdf8 (cyan)
  if (visits < 7) return 'rgba(34, 197, 94, 0.6)';   // #22c55e (green)
  if (visits < 12) return 'rgba(234, 179, 8, 0.6)';  // #eab308 (yellow)
  if (visits < 20) return 'rgba(249, 115, 22, 0.6)'; // #f97316 (orange)
  return 'rgba(239, 68, 68, 0.7)';                   // #ef4444 (red)
};

const getBorderColor = (visits) => {
    if (visits === 0) return 'rgb(148, 163, 184)'; // 진한 회색
    return 'white'; // 컬러 버블은 흰색 테두리
}

const generateChartData = () => ({
  datasets: [{
    data: districts.value.map((d, i) => ({
      x: (i % 5), // 5x5 그리드 배치
      y: Math.floor(i / 5),
      r: Math.max(10, Math.min(8 + (d.visits * 1.8), 45)), // 버블 크기 범위 조정
      visitCount: d.visits,
      name: d.name
    })),
    backgroundColor: districts.value.map(d => getColor(d.visits)),
    borderColor: districts.value.map(d => getBorderColor(d.visits)),
    borderWidth: 2,
    hoverBackgroundColor: districts.value.map(d => getColor(d.visits).replace('0.6', '0.9').replace('0.7', '1.0')),
    hoverBorderColor: 'white',
    hoverBorderWidth: 3,
  }]
});

const updateChart = () => {
  localStorage.setItem('stampRallyData', JSON.stringify(districts.value));
  if (myChart) {
    myChart.data = generateChartData();
    myChart.update('none'); // 애니메이션 없이 업데이트하여 부드러운 반응 유도
  }
};

onMounted(async () => {
  const saved = localStorage.getItem('stampRallyData');
  if (saved) districts.value = JSON.parse(saved);

  await nextTick();
  const ctx = document.getElementById('stampChart').getContext('2d');

  myChart = new Chart(ctx, {
    type: 'bubble',
    data: generateChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 20 // 차트 내부 패딩
      },
      plugins: {
        legend: { display: false },
        // 툴팁 설정: 모던하게 변경
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => tooltipItems[0].raw.name + '구',
            label: (tooltipItem) => `방문 횟수: ${tooltipItem.raw.visitCount}회`
          }
        },
        // 데이터 라벨 설정: 버블 중앙에 구 이름 표시
        datalabels: {
          color: '#1e293b', // 진한 텍스트 컬러
          font: { size: 11, weight: 'bold', family: 'Pretendard, sans-serif' },
          formatter: (value) => value.visitCount > 0 ? value.name : '', // 방문 0회는 이름 숨김
          // 라벨이 겹칠 경우 숨기는 옵션
          clamp: true,
          display: 'auto'
        }
      },
      // 축 숨김
      scales: {
        x: { display: false, min: -1, max: 5 },
        y: { display: false, min: -1, max: 5 }
      },
      // 상호작용 모드
      interaction: {
        mode: 'point',
        intersect: true
      },
      // 애니메이션 설정
      animation: {
          duration: 800,
          easing: 'easeOutQuart'
      }
    }
  });
});
</script>

<style scoped>
/* --- 디자인 시스템 상속 및 재정의 --- */
/* 두 번째 코드의 스타일을 기반으로 함 */

.place-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30%),
    linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); /* 배경 톤을 약간 더 차분하게 변경 */
  border-radius: 28px;
  color: #0f172a;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
  color: white;
  padding: 32px 35px;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.25);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
}

.hero-card h1 {
  margin: 0 0 12px;
  font-size: 1.8rem;
  line-height: 1.2;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 650px;
  font-size: 1.05rem;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 14px 20px;
  border-radius: 999px;
  font-weight: 800;
  backdrop-filter: blur(10px);
  font-size: 1.1rem;
}

.dashboard-card {
  background: white;
  padding: 10px; /* 내부 여백 줄임, 래퍼에서 패딩 처리 */
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-wrapper {
  width: 100%;
  height: 480px; /* 차트 높이 확보 */
  position: relative;
}

/* --- 입력 섹션 스타일링 --- */
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* 카드 최소 너비 조정 */
  gap: 16px;
}

.controls-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.input-card {
  background: #f8fafc; /* 카드 배경색 변경 */
  padding: 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}

.input-card:hover {
  transform: translateY(-3px);
  background: white;
  border-color: #e0e7ff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
}

.input-card label {
  font-weight: 800;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #1e293b;
}

.stylish-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #2563eb;
  background: transparent;
  transition: all 0.3s;
}

.stylish-input:focus {
  border-color: #63b3ed;
  background: white;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
  outline: none;
}

/* 스피너 버튼 숨기기 (UX 개선) */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* --- 반응형 스타일 (두 번째 코드와 일치) --- */
@media (max-width: 768px) {
  .place-page {
    padding: 18px;
    gap: 18px;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
  }

  .hero-badge {
    margin-top: 8px;
    font-size: 1rem;
  }

  .chart-wrapper {
    height: 350px; /* 모바일에서 차트 높이 축소 */
  }

  .input-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>