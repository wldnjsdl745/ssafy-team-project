<template>
  <header>
    <nav>
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