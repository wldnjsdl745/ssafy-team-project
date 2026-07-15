<template>
  <section class="stamp-rally">
    <!-- Header Section -->
    <header class="page-header">
      <h1>도장 깨기 현황</h1>
      <p>서울시 25개 구를 달리며 방문 기록을 채워보세요!</p>
    </header>

    <!-- Main Chart Section -->
    <div class="dashboard-card">
      <div class="chart-wrapper">
        <canvas id="stampChart"></canvas>
      </div>
    </div>

    <!-- Stats Input Section -->
    <div class="input-grid">
      <div v-for="(gu, index) in districts" :key="gu.name" class="input-card">
        <label>{{ gu.name }}</label>
        <input 
          type="number" 
          v-model.number="gu.visits" 
          @input="updateChart" 
          min="0" 
          max="50"
          placeholder="0"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
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

const getColor = (visits) => {
  if (visits === 0) return '#f7fafc'; // 거의 흰색에 가까운 밝은 회색
  if (visits < 5) return '#81e6d9'; 
  if (visits < 10) return '#68d391'; 
  if (visits < 15) return '#f6e05e'; 
  if (visits < 20) return '#f6ad55'; 
  return '#f56565'; 
};

const updateChart = () => {
  localStorage.setItem('stampRallyData', JSON.stringify(districts.value));
  if (myChart) {
    myChart.data.datasets[0].data = districts.value.map((d, i) => ({
      x: (i % 5),
      y: Math.floor(i / 5),
      r: Math.min(15 + (d.visits * 1.5), 40),
      visitCount: d.visits,
      name: d.name
    }));
    myChart.data.datasets[0].backgroundColor = districts.value.map(d => getColor(d.visits));
    myChart.update();
  }
};

onMounted(async () => {
  const saved = localStorage.getItem('stampRallyData');
  if (saved) districts.value = JSON.parse(saved);

  await nextTick();
  const ctx = document.getElementById('stampChart').getContext('2d');
  
  myChart = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        data: districts.value.map((d, i) => ({
          x: (i % 5),
          y: Math.floor(i / 5),
          r: Math.min(15 + (d.visits * 1.5), 40),
          visitCount: d.visits,
          name: d.name
        })),
        backgroundColor: districts.value.map(d => getColor(d.visits)),
        borderColor: '#4a5568',
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        datalabels: {
          color: '#2d3748',
          font: { size: 11, weight: 'bold' },
          formatter: (value) => value.name
        }
      },
      scales: { x: { display: false, min: -0.5, max: 4.5 }, y: { display: false, min: -0.5, max: 4.5 } }
    }
  });
});
</script>

<style scoped>
.stamp-rally {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin-bottom: 10px;
}

.dashboard-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.chart-wrapper {
  width: 100%;
  height: 450px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.input-card {
  background: white;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.input-card:hover {
  transform: translateY(-2px);
}

.input-card label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  outline: none;
}

input:focus {
  border-color: #63b3ed;
  box-shadow: 0 0 0 2px #bee3f8;
}
</style>