<template>
  <div id="show-save">
    <el-form
      label-position="left"
      v-if="saveData.m_iMoney"
      style="width: 40rem; margin: auto"
    >
      <el-form-item label="基础信息">
        <el-row type="flex" justify="space-around">
          <el-col :span="10">
            <el-input
              v-model="saveData.m_iMoney"
              size="medium"
              style="width: 10rem"
            >
              <template slot="prepend">金钱</template>
            </el-input>
          </el-col>
          <el-col :span="10">
            <el-input
              v-model="saveData.m_iAttributePoints"
              size="medium"
              style="width: 10rem"
            >
              <template slot="prepend">阅历</template>
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="队伍成员">
        <el-row type="flex" justify="space-around">
          <el-col :span="10">
            <el-select v-model="currentTeammate" placeholder="选择队员进行修改">
              <el-option
                v-for="npcId in saveData.m_TeammateList"
                :key="npcId"
                :label="npcInfo(npcId).sNpcName"
                :value="npcId"
              />
            </el-select>
          </el-col>
          <el-col :span="10">
            <el-button @click="dialogVisible = true">修改队员</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <p v-else>请选择存档文件</p>
    <el-dialog title="修改队员" :visible.sync="dialogVisible" width="40rem">
      <el-transfer
        style="text-align: left"
        filterable
        :filter-method="doNpcFilter"
        v-model="saveData.m_TeammateList"
        :data="filteredNpcs"
        :titles="['候选', '选中']"
        :props="{
          key: 'ID',
          label: 'sNpcName',
        }"
      >
        <span
          slot-scope="{ option }"
          :title="option.sIntroduction"
          style="font-size: 12px"
          >{{ option.ID }}-{{ option.sNpcName }}</span
        >
      </el-transfer>
    </el-dialog>
  </div>
</template>

<script>
import { npcData } from "../tools/mod-resources";
import dataProcess from "../tools/data-process";
export default {
  name: "ShowSave",
  data() {
    return {
      saveData: {},
      currentTeammate: null,
      npcs: [],
      filteredNpcs: [],
      dialogVisible: false,
    };
  },
  props: ["saveFileHandler"],
  methods: {
    npcInfo(npcId) {
      return this.npcs.find((npc) => npc.ID == npcId) || {};
    },
    doNpcFilter(query, item) {
      if (query.trim() == "") {
        return true;
      }
      return (
        item.sNpcName.indexOf(query) != -1 ||
        item.sIntroduction.indexOf(query) != -1
      );
    },
  },
  watch: {
    saveFileHandler: async function (newValue) {
      console.log("文件变动！", newValue);
      if (newValue != null && newValue.name != null) {
        {
          let file = await newValue.getFile();
          const contents = await file.text();
          this.saveData = JSON.parse(contents);
          this.filteredNpcs = this.npcs;
          // this.filteredNpcs = this.npcs.filter((n) => n.iFriendly == 1);
        }
      }
    },
  },
  computed: {},
  mounted() {
    this.npcs = dataProcess.text2Dict(npcData);
  },
};
</script>