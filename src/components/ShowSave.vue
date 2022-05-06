<template>
  <div id="show-save">
    <el-form
      label-position="left"
      v-if="saveData.m_iMoney"
      style="width: 60rem; margin: auto"
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
      <el-form-item label="物品栏">
        <el-table
          :data="
            myItems.filter(
              (i) =>
                (isAddItem || i.m_iAmount > 0) &&
                (!searchItem ||
                  searchItem.trim() == '' ||
                  i.Name.indexOf(searchItem) != -1 ||
                  i.Desc.indexOf(searchItem) != -1)
            )
          "
          style="width: 100%"
          max-height="360"
          height="360"
        >
          <el-table-column prop="ID" label="物品ID" width="80">
          </el-table-column>
          <el-table-column label="物品名称" width="140" prop="Name">
          </el-table-column>
          <el-table-column
            label="分类"
            width="80"
            :filters="
              ['武器', '防具', '饰品', '消耗品', '任务品', '秘籍'].map(
                (t, i) => ({ text: t, value: i + 1 })
              )
            "
            :filter-multiple="false"
            :filter-method="(query, row) => row.Type == query"
          >
            <template slot-scope="scope">
              <span>{{
                ["", "武器", "防具", "饰品", "消耗品", "任务品", "秘籍"][
                  scope.row.Type
                ]
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Desc">
            <template slot="header" slot-scope="_">
              <el-input v-model="searchItem" size="mini" @dblclick="log(_)" />
            </template>
            <template slot-scope="scope">
              <span style="font-size: 12px">{{ scope.row.Desc }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物品数量" width="200">
            <template slot="header" slot-scope="_">
              <el-switch
                v-model="isAddItem"
                active-text="新增"
                inactive-text="已有"
                size="mini"
                @dblclick="log(_)"
              />
            </template>
            <template slot-scope="scope">
              <el-input-number
                style="margin-left: 10px; width: 5rem"
                v-model="scope.row.m_iAmount"
                size="mini"
                :min="0"
                :controls="false"
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="队伍成员">
        <el-select
          multiple
          v-model="saveData.m_TeammateList"
          size="small"
          style="width: 50rem"
          filterable
        >
          <el-option
            v-for="npc in filteredNpcs"
            :key="npc.ID"
            :label="npc.sNpcName"
            :value="npc.ID"
            :title="npc.ID + '：' + npc.sIntroduction"
          >
            <span style="float: left">{{ npc.sNpcName }}</span>
            <span
              style="
                float: right;
                font-size: 0.7rem;
                text-overflow: ellipsis;
                width: 42rem;
                overflow: hidden;
                white-space: nowrap;
                padding-left: 10px;
              "
              >{{ npc.sIntroduction }}</span
            >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="人物信息">
        <el-select
          v-model="currentTeammate"
          placeholder="选择人物"
          @change="chooseTeammate"
          size="small"
          style="width: 50rem"
        >
          <el-option
            v-for="npcId in saveData.m_TeammateList"
            :key="npcId"
            :label="npcInfo(npcId).sNpcName"
            :value="npcId"
          >
            <span style="float: left">{{ npcInfo(npcId).sNpcName }}</span>
            <span
              style="
                float: right;
                font-size: 0.7rem;
                text-overflow: ellipsis;
                width: 42rem;
                overflow: hidden;
                white-space: nowrap;
                padding-left: 10px;
              "
              >{{ npcInfo(npcId).sIntroduction }}</span
            >
          </el-option>
        </el-select>
        <el-form inline v-if="currentTeammate">
          <el-form-item label="臂力">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="currentTeammateInfo.iStr"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 3rem"
              v-model="currentTeammateInfo.iMaxStr"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="根骨">
            <el-input-number
              style="width: 3rem"
              v-model="currentTeammateInfo.iCon"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 3rem"
              v-model="currentTeammateInfo.iMaxCon"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="悟性">
            <el-input-number
              style="width: 4rem"
              v-model="currentTeammateInfo.iInt"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 4rem"
              v-model="currentTeammateInfo.iMaxInt"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="身法">
            <el-input-number
              style="width: 4rem"
              v-model="currentTeammateInfo.iDex"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 4rem"
              v-model="currentTeammateInfo.iMaxDex"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="天赋">
            <el-select
              style="width: 40rem"
              multiple
              v-model="currentTeammateInfo.TalentList"
            >
              <el-option
                v-for="talent in talents"
                :key="talent.iTalenID"
                :label="talent.sTalenName"
                :value="talent.iTalenID"
                :title="talent.sTalenTip"
              >
                <span style="float: left">{{ talent.sTalenName }}</span>
                <span
                  style="
                    float: right;
                    font-size: 0.7rem;
                    text-overflow: ellipsis;
                    width: 35em;
                    overflow: hidden;
                    white-space: nowrap;
                    padding-left: 20px;
                  "
                  >{{ talent.sTalenTip }}</span
                >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
    </el-form>

    <p v-else>请选择存档文件</p>
    <el-dialog title="修改队员" :visible.sync="teammateVisible" width="40rem">
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
import { npcData, itemData, talentNewData } from "../tools/mod-resources";
import dataProcess from "../tools/data-process";
export default {
  name: "ShowSave",
  data() {
    return {
      saveData: {},
      currentTeammate: null,
      currentTeammateInfo: {},
      npcs: [],
      items: [],
      talents: [],
      myItems: [],
      filteredNpcs: [],
      teammateVisible: false,
      iteamVisible: false,
      selectedItem: [],
      searchItem: null,
      isAddItem: false,
    };
  },
  props: ["saveFileHandler"],
  computed: {},
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
        (item.sIntroduction && item.sIntroduction.indexOf(query) != -1)
      );
    },
    chooseTeammate(value) {
      this.currentTeammateInfo = this.saveData.m_NpcList.find(
        (n) => n.iNpcID == value
      );
    },
    log(...args) {
      console.log(args);
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
          this.filteredNpcs = this.npcs.filter((n) =>
            this.saveData.m_NpcList.find((npc) => npc.iNpcID == n.ID)
          );
          if (this.saveData.m_BackpackList && this.items) {
            let items = [...this.items];
            items.forEach((item) => {
              let old = this.saveData.m_BackpackList.find(
                (i) => i.m_ItemID == item.ID
              );
              if (old) {
                item.m_iAmount = old.m_iAmount;
              } else {
                item.m_iAmount = 0;
              }
            });
            this.myItems = items;
          }
        }
      }
    },
  },
  mounted() {
    this.npcs = dataProcess.text2Dict(npcData);
    this.items = dataProcess.text2Dict(itemData);
    this.talents = dataProcess.text2Dict(talentNewData);
  },
};
</script>