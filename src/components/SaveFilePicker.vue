<template>
  <div id="saveFilePicker">
    <el-form inline>
      <el-form-item label="存档文件">
        <el-input v-model="saveFileHandler.name" size="medium" disabled>
          <el-button @click="openSaveFile" slot="append">
            选择
          </el-button>
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SaveFilePicker",
  data() {
    return {
      saveFileHandler: { name: "" },
    };
  },
  computed: {},
  methods: {
    openSaveFile: async function () {
      let fileHandle;
      try {
        [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              accept: {
                "application/x-rar-compressed": [".Save"],
              },
            },
          ],
          excludeAcceptAllOption: true,
        });
        this.saveFileHandler = fileHandle;
      } catch (e) {
        console.error(e);
        return;
      }
      this.$emit("open-save", fileHandle);
    },
  },
  mounted() {},
};
</script>

<style scoped>
</style>