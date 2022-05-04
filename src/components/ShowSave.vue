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
        <el-table
          :data="saveData.m_BackpackList"
          style="width: 100%"
          max-height="360"
        >
          <el-table-column prop="m_ItemID" label="物品ID" width="80">
          </el-table-column>
          <el-table-column label="物品名称" width="140">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{
                itemInfo(scope.row.m_ItemID).Name
              }}</span>
            </template>
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
                  itemInfo(scope.row.m_ItemID).Type
                ]
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物品描述">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{
                itemInfo(scope.row.m_ItemID).Desc
              }}</span>
            </template>
          </el-table-column>
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
    <el-dialog title="增加物品" :visible.sync="iteamVisible" width="60rem">
      <el-table
        :data="
          items.filter(
            (i) =>
              !searchItem ||
              i.Name.indexOf(searchItem) != -1 ||
              i.Desc.indexOf(searchItem) != -1
          )
        "
        style="width: 100%"
        max-height="360"
        @selection-change="handleItemSelect"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="ID" label="物品ID" width="80"> </el-table-column>
        <el-table-column prop="Name" label="物品名称" width="140">
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
        <el-table-column prop="Desc" label="物品描述"> </el-table-column>
        <el-table-column label="物品描述2" width="140">
          <template slot="header">
            <el-input
              v-model="searchItem"
              size="mini"
              placeholder="输入关键字搜索"
            />
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.Desc2 || "" }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="handleAddItem" style="margin-top: 10px"
        >添加</el-button
      >
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
  computed: {},
  mounted() {
    this.npcs = dataProcess.text2Dict(npcData);
    this.items = dataProcess.text2Dict(itemData);
  },
};
</script>