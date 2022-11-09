<template>
  <div>
    <Background @showImageDirs="showImageDirs" :tagsData="tagsData" />
    <Settings
      v-show="loadSettings.imageDirs && imagesCache.length == 0"
      :userSettings="userSettings"
      :loadSettings="loadSettings"
      @getImagesData="getImagesData"
    />
  </div>
  <div v-if="imagesCache.length > 0">
    <tag-filter
      :filterSettings="filterSettings"
      :tagsData="tagsData"
      :allKeywordsArray="allKeywordsArray"
    />
    <search-input
      @searchImage="searchImage"
      :allKeywordsArray="allKeywordsArray"
      :filterSettings="filterSettings"
    />
    <div id="images-wrapper" class="demo-image__preview">
      <el-row class="infinite-list" style="overflow: auto" :gutter="12">
        <el-col
          :span="24 / userSettings.rowLimitCount"
          v-for="i in imagesCount"
          :key="currentImages[i - 1].imageUrl"
        >
          <el-card>
            <image-preview
              @loadingError="loadingError"
              :imagesUrlArray="imagesUrlArray"
              :image="currentImages[i - 1]"
              :index="i - 1"
            />
            <pop-over
              :image="currentImages[i - 1]"
              :userSettings="userSettings"
              :tagsData="tagsData"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Background from "../components/Background.vue";
import Settings from "../components/Settings.vue";
import ImagePreview from "../components/ImagePreview.vue";
import PopOver from "../components/PopOver.vue";
import SearchInput from "../components/SearchInput.vue";
import TagFilter from "../components/TagFilter.vue";
import { ElLoading } from "element-plus";

export default {
  name: "App",
  components: {
    Background,
    Settings,
    ImagePreview,
    PopOver,
    SearchInput,
    TagFilter,
  },
  data() {
    return {
      tagsData: {
        allTags: [],
        allTagsIndex: [],
        tagCategories: [],
        tagsInclude: [],
        tagsIncludeIndex: [],
      },
      imagesCount: 0,
      currentImages: [],
      imagesCache: [],
      allKeywordsArray: [],
      errorUrls: [],
      imagesUrlArray: [],
      showingError: false,
      loadSettings: {
        imageDirs: [],
        loadingDir: false,
      },
      filterSettings: {
        isShow: false,
        primaryCategory: "",
        subCategory: "",
        subCategoryList: [],
      },
      userSettings: {
        imagesLimitCount: 200,
        rowLimitCount: 3,
        classifyPrompt: false,
      },
      loadingInstance: null,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.scrollLoad);
  },
  methods: {
    getImagesData(arrayIndex = 0, realIndex = 0) {
      if (arrayIndex > this.loadSettings.imageDirs.length - 1) {
        this.imagesUrlArray = this.getImagesUrlArray();
        this.allKeywordsArray = this.getAllKeywordsArray();
        return this.loadingInstance.close();
      }
      if (!this.loadingInstance) {
        this.loadingInstance = ElLoading.service({ fullscreen: true });
      }
      const imageDir = this.loadSettings.imageDirs[arrayIndex];
      if (!imageDir.selected) {
        this.getImagesData(arrayIndex + 1, realIndex);
      } else {
        this.loadingInstance.text = `正在加载第${realIndex + 1}个图库`;
        this.$axios({
          method: "post",
          url: "/getImagesData",
          data: [imageDir],
        }).then((res) => {
          this.imagesCache.push(...res.data);
          this.initImages();
          this.getImagesData(arrayIndex + 1, realIndex + 1);
        });
      }
    },
    getImagesMaxCount() {
      return Math.min(
        this.userSettings.imagesLimitCount,
        this.currentImages.length
      );
    },
    showImageDirs(imageDirs) {
      for (let imageDir of imageDirs) {
        this.loadSettings.imageDirs.push({
          dirName: imageDir,
          selected: true,
        });
      }
      this.loadSettings.loadingDir = true;
    },
    initImages() {
      let sliceNum = Math.min(
        this.userSettings.imagesLimitCount,
        this.imagesCache.length
      );
      this.currentImages = this.imagesCache.slice(0, sliceNum);
      if (this.imagesCount < this.userSettings.rowLimitCount * 3) {
        this.scrollLoad();
      }
    },
    scrollLoad() {
      let maxCount = this.getImagesMaxCount();
      let restCount = maxCount - this.imagesCount;
      if (restCount == 0) return;
      if (restCount < this.userSettings.rowLimitCount * 3) {
        this.imagesCount += restCount;
      } else {
        this.imagesCount += this.userSettings.rowLimitCount * 3;
      }
    },
    getAllKeywordsArray() {
      let data = [];
      let cache = [];
      for (let imageData of this.imagesCache) {
        const { description } = imageData;
        if (!description || description == "") {
          continue;
        }
        let keywordsArray = description.split(",").map((v) => {
          return v
            .trim()
            .replace(/\{/g, "")
            .replace(/\}/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "")
            .replace(/\)/g, "");
        });
        for (let keyword of keywordsArray) {
          let lowerKeyword = keyword.toLowerCase();
          if (!cache.includes(lowerKeyword)) {
            cache.push(lowerKeyword);
            data.push({ value: lowerKeyword });
          }
        }
      }
      return data;
    },
    getImagesUrlArray() {
      let imagesUrlArray = [];
      for (let image of this.currentImages) {
        imagesUrlArray.push(image.imageUrl);
      }
      return imagesUrlArray;
    },
    loadingError(imageUrl) {
      this.errorUrls.push(imageUrl);
      if (this.showingError) {
        return;
      } else {
        this.showingError = true;
        let message = this.$message({
          showClose: true,
          message: "图片加载出错，请检查图片位置或json文件是否有误！",
          type: "error",
        });
        message.onClose = () => {
          this.showingError = false;
        };
      }
    },
    searchImage(keywordsArray) {
      if (keywordsArray[0] == "") {
        return (this.currentImages = this.imagesCache);
      }
      let matchImages = [];
      for (let imageData of this.imagesCache) {
        let match = false;
        let description = imageData.description;
        if (description && description !== "") {
          for (let targetKeyword of keywordsArray) {
            if (description.includes(targetKeyword.trim())) {
              match = true;
              break;
            }
          }
        }

        if (match) matchImages.push(imageData);
      }
      this.imagesCount = 0;
      this.currentImages = matchImages;
      this.imagesUrlArray = this.getImagesUrlArray();
      this.scrollLoad(true);
    },
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#filter-button {
  margin-left: 10px;
}

#images-wrapper {
  padding-top: 65px;
}
</style>
