<template>
  <div class="image-preview">
    <el-tag class="tag-from" type="info">{{ image.from }}</el-tag>
    <el-image
      style="width: 100%; height: 300px"
      :src="image.imageUrl"
      :preview-src-list="imagesUrlArray"
      :initial-index="index"
      :hide-on-click-modal="true"
      fit="cover"
      @error="loadingError"
    >
    </el-image>
  </div>
</template>


<script>
export default {
  props: ["imagesUrlArray", "image", "index"],
  methods: {
    loadingError() {
      this.$emit("loadingError", this.image.imageUrl);
    },
  },
};
</script>

<style>
.image-preview {
  position: relative;
}

.tag-from {
  z-index: 9;
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 1.03em;
}
</style>