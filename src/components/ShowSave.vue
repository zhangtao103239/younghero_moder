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
        <el-button type="primary" plain @click="iteamVisible = true"
          >增加物品</el-button
        >
        <el-table :data="backpackList" style="width: 100%" max-height="360">
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
            :filter-method="doFilterItemType"
          >
            <template slot-scope="scope">
              <span>{{
                ["", "武器", "防具", "饰品", "消耗品", "任务品", "秘籍"][
                  scope.row.Type
                ]
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物品描述" prop="Desc"> </el-table-column>
          <el-table-column label="物品数量" width="180">
            <template slot-scope="scope">
              <el-input-number
                style="margin-left: 10px"
                v-model="scope.row.m_iAmount"
                size="mini"
                :controls="false"
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table>
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
            <el-button @click="teammateVisible = true">修改队员</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item
        :label="npcInfo(currentTeammate).sNpcName"
        v-if="currentTeammate"
      >
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
import { npcData, itemData } from "../tools/mod-resources";
import dataProcess from "../tools/data-process";
export default {
  name: "ShowSave",
  data() {
    return {
      saveData: {},
      currentTeammate: null,
      npcs: [],
      items: [],
      filteredNpcs: [],
      teammateVisible: false,
      iteamVisible: false,
      selectedItem: [],
      searchItem: null,
    };
  },
  props: ["saveFileHandler"],
  computed: {
    backpackList: {
      get: function () {
        if (this.saveData.m_BackpackList && this.items) {
          let items = [...this.items];
          for (let item in items) {
            let old = this.saveData.m_BackpackList.find(
              (i) => i.m_ItemID == item.ID
            );
            if (old) {
              item.m_iAmount = old.m_iAmount;
            } else {
              item.m_iAmount = 0;
            }
          }
          return items;
        }
        return [];
      },
      set: function (newValue) {
        for (let item in newValue) {
          if (item.m_iAmount) {
            let old = this.saveData.m_BackpackList.find(
              (i) => i.m_ItemID == item.ID
            );
            if (old) {
              if (old.m_iAmount != item.m_iAmount) {
                old.m_iAmount = item.m_iAmount;
                old.m_bNew = true;
              }
            } else {
              this.saveData.m_BackpackList.push({
                m_ItemID: item.ID,
                m_iAmount: item.m_iAmount,
                m_bNew: true,
              });
            }
          }
        }
      },
    },
  },
  methods: {
    npcInfo(npcId) {
      return this.npcs.find((npc) => npc.ID == npcId) || {};
    },
    itemInfo(itemID) {
      return this.items.find((i) => i.ID == itemID) || {};
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
    doFilterItemType(query, row) {
      if (row.Type) {
        return query == row.Type;
      } else {
        return this.itemInfo(row.m_ItemID).Type == query;
      }
    },
    handleAddItem() {
      this.saveData.m_BackpackList.push(
        ...this.selectedItem.map((i) => {
          return {
            m_bNew: true,
            m_iAmount: 1,
            m_ItemID: i.ID,
          };
        })
      );
      this.iteamVisible = false;
    },
    handleItemSelect(value) {
      this.selectedItem = value;
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
  mounted() {
    this.npcs = dataProcess.text2Dict(npcData);
    this.items = dataProcess.text2Dict(itemData);
  },
};
</script>