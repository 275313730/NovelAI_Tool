<template>
  <div>
    <Settings
      v-show="loadSettings.imageDirs && imagesCache.length == 0"
      :userSettings="userSettings"
      :loadSettings="loadSettings"
      @getImagesData="getImagesData"
    />
    <div id="gallery" v-if="imagesCache.length > 0">
      <tag-filter
        :filterSettings="filterSettings"
        :tagsData="tagsData"
        :allKeywordsArray="allKeywordsArray"
      />
      <search-input
        @searchImage="searchImage"
        @reload="reload"
        :allKeywordsArray="allKeywordsArray"
        :filterSettings="filterSettings"
      />
      <div id="images-wrapper" class="demo-image__preview">
        <el-row>
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
  </div>
</template>

<script>
import Settings from "../components/Settings.vue";
import ImagePreview from "../components/ImagePreview.vue";
import PopOver from "../components/PopOver.vue";
import SearchInput from "../components/SearchInput.vue";
import TagFilter from "../components/TagFilter.vue";
import { ElLoading } from "element-plus";

export default {
  components: {
    Settings,
    ImagePreview,
    PopOver,
    SearchInput,
    TagFilter,
  },
  props: ["tagsData"],
  data() {
    return {
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
    this.checkImageDirs();
    this.initScrollEvent();
  },
  methods: {
    async checkImageDirs() {
      const res = await this.$axios.get("/checkImageDirs");
      const { imageDirs } = res.data;
      for (let imageDir of imageDirs) {
        this.loadSettings.imageDirs.push({
          dirName: imageDir,
          selected: true,
        });
      }
      this.loadSettings.loadingDir = true;
    },
    async getImagesData(arrayIndex = 0, realIndex = 0) {
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
        const res = await this.$axios({
          method: "post",
          url: "/getImagesData",
          data: [imageDir],
        });
        this.imagesCache.push(...res.data);
        this.initImages();
        this.getImagesData(arrayIndex + 1, realIndex + 1);
      }
    },
    initImages() {
      this.currentImages = this.imagesCache;
      if (this.imagesCount < this.userSettings.rowLimitCount * 3) {
        this.scrollLoad();
      }
    },
    initScrollEvent() {
      var scrollFunc = (e) => {
        var e = e || window.event;
        if (e.wheelDelta) {
          if (e.wheelDelta < 0) {
            this.scrollLoad();
          }
        } else if (e.detail) {
          if (e.detail > 0) {
            this.scrollLoad();
          }
        }
      };
      // 给页面绑定鼠标滚轮事件,针对火狐的非标准事件
      window.addEventListener("DOMMouseScroll", scrollFunc);
      // 给页面绑定鼠标滚轮事件，针对Google，mousewheel非标准事件已被弃用，请使用 wheel事件代替
      window.addEventListener("wheel", scrollFunc);
      // ie不支持wheel事件，若一定要兼容，可使用mousewheel
      window.addEventListener("mousewheel", scrollFunc);
    },
    scrollLoad() {
      let restCount = this.currentImages.length - this.imagesCount;
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
          message: "图片加载出错，请检查图片完整性",
          type: "error",
        });
        message.onClose = () => {
          this.showingError = false;
        };
      }
    },
    searchImage(keywordsArray) {
      let matchImages = [];
      if (keywordsArray[0] == "") {
        matchImages = this.imagesCache;
      } else {
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
      }

      this.imagesCount = 0;
      scrollTo(0, 0);
      this.currentImages = matchImages;
      this.imagesUrlArray = this.getImagesUrlArray();
      this.scrollLoad(true);
    },
    async reload() {
      this.imagesCache = [];
      this.currentImages = [];
      this.imagesCount = 0;
      this.imagesUrlArray = [];
      this.loadSettings.imageDirs = [];
      this.loadSettings.loadingDir = false;
      await this.checkImageDirs();
    },
  },
};
</script>

<style>
#images-wrapper {
  padding-top: 50px;
}
</style>
