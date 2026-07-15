<template>
  <header class="topbar">
    <div class="brand">LocalHub</div>
    <nav class="nav-links">
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/places">장소 목록</RouterLink>
      <RouterLink to="/community">커뮤니티</RouterLink>
      <RouterLink to="/stamp">도장 깨기</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  margin: 16px 16px 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 30px rgba(56, 33, 15, 0.06);
  border: 1px solid rgba(120, 88, 60, 0.12);
}

.brand {
  font-weight: 800;
  color: #4b2f1d;
  letter-spacing: 0.08em;
}

.nav-links {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.nav-links a {
  padding: 8px 12px;
  border-radius: 999px;
  color: #6b5138;
  font-weight: 600;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: #f7ebdc;
  color: #4b2f1d;
}

main {
  padding: 32px 16px 48px;
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    gap: 10px;
    border-radius: 20px;
  }
}
</style>