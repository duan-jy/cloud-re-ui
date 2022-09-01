<template>
  <div v-if="loading" class="mpr-loading">
    <slot name="loading">
      <div class="loader">
        <ul class="hexagon-container">
          <li class="hexagon hex_1" />
          <li class="hexagon hex_2" />
          <li class="hexagon hex_3" />
          <li class="hexagon hex_4" />
          <li class="hexagon hex_5" />
          <li class="hexagon hex_6" />
          <li class="hexagon hex_7" />
        </ul>
        <div class="load-text">LOADING...</div>
      </div>
    </slot>
  </div>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./loading.scss";
ul li {
  list-style: none;
}
.mpr-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 17777;
  background: rgba(59, 70, 117, 0.6);
}
</style>
