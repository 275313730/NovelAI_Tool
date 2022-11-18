<template>
  <div id="home">
    <div class="main-title">欢迎使用NovelAI_Tool</div>
    <br />
    <div class="sub-title">使用说明</div>
    <div>1. 在左侧菜单栏切换功能</div>
    <div>2. 图库使用方法</div>
    <div>①在项目中的images文件夹里创建一个新文件夹</div>
    <div>②在文件夹中并放入图片</div>
    <div>③可以创建多个文件夹以分类</div>
    <div>例如:/images/my_images/example.png</div>
    <div>3. 设置中可以下载网盘图片和检查版本更新</div>
    <br />
    <div class="sub-title">其他</div>
    <div>本工具qq群为662176214</div>
    <div>如果觉得工具还不错可以扫下面的二维码赞助作者</div>
    <br />
    <el-row justify="space-evenly">
      <el-col :span="6">
        <span>微信</span>
        <el-image src="./wx.png"></el-image>
      </el-col>
      <el-col :span="6">
        <span>支付宝</span>
        <el-image src="./alipay.jpg"></el-image>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {};
</script>

<style>
#home {
  padding-top: 10px;
  max-width: 70%;
  margin: auto;
  left: 0;
  right: 0;
}

.main-title {
  font-size: var(--el-font-size-extra-large);
  font-weight: bold;
}

.sub-title {
  font-size: var(--el-font-size-large);
  font-weight: bold;
}
</style>