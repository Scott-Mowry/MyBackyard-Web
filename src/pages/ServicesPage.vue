<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1200px">
      <div class="text-h4 text-weight-bold q-mb-lg">Our Services</div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-4" v-for="service in services" :key="service.title">
          <q-card class="service-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ service.title }}</div>
              <q-icon :name="service.icon" size="3rem" color="primary" class="q-mb-md" />
              <p class="text-body1">{{ service.description }}</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" :label="service.buttonText" :to="service.link" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const services = ref([
  {
    title: 'Local Business Directory',
    icon: 'store',
    description:
      'Discover and connect with local businesses in your neighborhood. Find everything from restaurants to professional services.',
    buttonText: 'Browse Directory',
    link: '/directory',
  },
  {
    title: 'Community Events',
    icon: 'event',
    description:
      'Stay updated with local events, gatherings, and activities happening in your community.',
    buttonText: 'View Events',
    link: '/events',
  },
  {
    title: 'Local Services',
    icon: 'handyman',
    description:
      'Access trusted local service providers for home maintenance, repairs, and professional services.',
    buttonText: 'Find Services',
    link: '/services',
  },
])
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
}

.service-card {
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}
</style>
