<template>
  <div class="home">
    <save-file-picker @open-save="handlerSaveOpen"></save-file-picker>
    <show-save :saveFileHandler="saveFileHandler"></show-save>
  </div>
</template>

<script>
import SaveFilePicker from "@/components/SaveFilePicker.vue";
import ShowSave from "@/components/ShowSave.vue";

export default {
  name: "HomeView",
  components: {
    SaveFilePicker,
    ShowSave,
  },
  data() {
    return {
      saveFileHandler: null,
    };
  },
  methods: {
    handlerSaveOpen: function (fileHandler) {
      this.saveFileHandler = fileHandler;
    },
  },
};
</script>
