<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <!-- Background with gradient -->
      <div class="auth-background">
        <!-- Main Content -->
        <div class="auth-content">
          <router-view />
        </div>

        <!-- Footer -->
        <div class="auth-footer text-center q-pa-md">
          <div class="text-caption text-grey-8">
            &copy; {{ new Date().getFullYear() }} My Backyard USA. All rights reserved.
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// No additional logic needed for this component
</script>

<style lang="scss" scoped>
.auth-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  position: relative;
}

.auth-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.auth-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.auth-content {
  width: 100%;
}

.auth-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.full-height {
  min-height: calc(100vh - 120px); // Account for header and footer
  padding: 80px 0;
}
</style>
