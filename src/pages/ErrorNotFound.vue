<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="column items-center q-pa-lg bg-white rounded-borders shadow-2" style="width: 400px">
      <q-icon name="error_outline" size="5rem" color="negative" class="q-mb-md" />

      <div class="text-h4 text-weight-bold q-mb-sm text-center">404</div>

      <div class="text-h6 text-weight-medium q-mb-lg text-center">Page Not Found</div>

      <p class="text-body1 text-center q-mb-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <q-btn color="primary" label="Go Home" to="/" unelevated />
    </div>
  </q-page>
</template>

<script setup>
// No additional logic needed for this component
</script>
