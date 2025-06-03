<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1200px">
      <div class="text-h4 text-weight-bold q-mb-lg">About My Backyard USA</div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Our Mission</div>
              <p class="text-body1">
                My Backyard USA is dedicated to connecting communities and empowering local
                businesses. We believe in creating a platform where neighbors can discover and
                support the best local services and businesses in their area.
              </p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Our Vision</div>
              <p class="text-body1">
                We envision a future where every community thrives through local connections and
                support. By bringing together residents and local businesses, we're building
                stronger, more vibrant neighborhoods across the United States.
              </p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">What We Offer</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="business" color="primary" size="2rem" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium"
                        >Local Business Directory</q-item-label
                      >
                      <q-item-label caption>
                        Discover and connect with local businesses in your area
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="people" color="primary" size="2rem" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Community Engagement</q-item-label>
                      <q-item-label caption>
                        Connect with neighbors and participate in local events
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="support_agent" color="primary" size="2rem" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Local Services</q-item-label>
                      <q-item-label caption>
                        Access trusted local services and professional providers
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
}
</style>
