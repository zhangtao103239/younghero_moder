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
              v-model.number="saveData.m_iMoney"
              size="medium"
              style="width: 10rem"
              type="number"
            >
              <template slot="prepend">金钱</template>
            </el-input>
          </el-col>
          <el-col :span="10">
            <el-input
              v-model.number="saveData.m_iAttributePoints"
              size="medium"
              style="width: 10rem"
              type="number"
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
              <el-input
                style="width: 10rem"
                v-model.number="scope.row.m_iAmount"
                size="mini"
                type="number"
                :min="0"
                :max="100"
                @change="changeItemNumber(scope.row)"
              >
                <template slot="append">个</template></el-input
              >
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
          v-model="curTeammateId"
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
        <el-form inline v-if="curTeammateId">
          <el-form-item label="臂力">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iStr"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 3rem"
              v-model="curTeammateInfo.iMaxStr"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="根骨">
            <el-input-number
              style="width: 3rem"
              v-model="curTeammateInfo.iCon"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 3rem"
              v-model="curTeammateInfo.iMaxCon"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="悟性">
            <el-input-number
              style="width: 4rem"
              v-model="curTeammateInfo.iInt"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 4rem"
              v-model="curTeammateInfo.iMaxInt"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="身法">
            <el-input-number
              style="width: 4rem"
              v-model="curTeammateInfo.iDex"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number
            >/
            <el-input-number
              style="width: 4rem"
              v-model="curTeammateInfo.iMaxDex"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="天赋">
            <el-select
              style="width: 47rem"
              multiple
              v-model="curTeammateInfo.TalentList"
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
          <el-form-item label="血量">
            <el-input-number
              style="margin-left: 10px; width: 7rem"
              v-model="curTeammateInfo.iMaxHp"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="内力">
            <el-input-number
              style="margin-left: 10px; width: 7rem"
              v-model="curTeammateInfo.iMaxSp"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="暴击">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iCri"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="反击">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iCounter"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="闪避">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iDodge"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="连击">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iCombo"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="移动格数">
            <el-input-number
              style="margin-left: 10px; width: 3rem"
              v-model="curTeammateInfo.iMoveStep"
              size="mini"
              :min="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="内功">
            <el-table
              :data="
                myNeigongs.filter(
                  (i) =>
                    (isAddNeigong || i.iLevel) &&
                    (!searchNeigong ||
                      searchNeigong.trim() == '' ||
                      i.Name.indexOf(searchNeigong) != -1 ||
                      i.Desc.indexOf(searchNeigong) != -1 ||
                      (i.sUpgradeNotes &&
                        i.sUpgradeNotes.indexOf(searchNeigong) != -1))
                )
              "
              style="width: 60rem"
              max-height="360"
              height="360"
            >
              <el-table-column prop="ID" label="内功ID" width="80">
              </el-table-column>
              <el-table-column label="内功名称" width="140" prop="Name">
              </el-table-column>
              <el-table-column label="描述" width="340" prop="Desc">
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{ scope.row.Desc }}</span>
                </template>
              </el-table-column>
              <el-table-column label="升级说明">
                <template slot="header" slot-scope="_">
                  <el-input
                    v-model="searchNeigong"
                    size="mini"
                    @dblclick="log(_)"
                    prefix-icon="el-icon-search"
                  >
                  </el-input>
                </template>
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{
                    scope.row.sUpgradeNotes
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="等级" width="200">
                <template slot="header" slot-scope="_">
                  <el-switch
                    v-model="isAddNeigong"
                    active-text="新增"
                    inactive-text="已有"
                    size="mini"
                    @dblclick="log(_)"
                  />
                </template>
                <template slot-scope="scope">
                  <el-input
                    style="width: 8rem"
                    v-model.number="scope.row.iLevel"
                    type="number"
                    size="mini"
                    :min="0"
                    :max="10"
                    :controls="false"
                    @change="changeNeigongLevel(scope.row)"
                    ><template slot="append">级</template></el-input
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="招式">
            <el-table
              :data="
                myRoutines.filter(
                  (i) =>
                    (isAddRoutine || i.iLevel) &&
                    (!searchRoutine ||
                      searchRoutine.trim() == '' ||
                      i.sRoutineName.indexOf(searchRoutine) != -1 ||
                      i.sRoutineTip.indexOf(searchRoutine) != -1 ||
                      (i.sUpgradeNotes &&
                        i.sUpgradeNotes.indexOf(searchRoutine) != -1))
                )
              "
              style="width: 60rem"
              max-height="360"
              height="360"
            >
              <el-table-column prop="iRoutineID" label="招式ID" width="80">
              </el-table-column>
              <el-table-column label="内功名称" width="140" prop="sRoutineName">
              </el-table-column>
              <el-table-column label="描述" width="340" prop="sRoutineTip">
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{
                    scope.row.sRoutineTip
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="升级说明">
                <template slot="header" slot-scope="_">
                  <el-input
                    v-model="searchRoutine"
                    size="mini"
                    @dblclick="log(_)"
                    prefix-icon="el-icon-search"
                  >
                  </el-input>
                </template>
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{
                    scope.row.sUpgradeNotes
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="等级" width="200">
                <template slot="header" slot-scope="_">
                  <el-switch
                    v-model="isAddRoutine"
                    active-text="新增"
                    inactive-text="已有"
                    size="mini"
                    @dblclick="log(_)"
                  />
                </template>
                <template slot-scope="scope">
                  <el-input
                    style="width: 8rem"
                    v-model.number="scope.row.iLevel"
                    type="number"
                    size="mini"
                    :min="0"
                    :max="10"
                    :controls="false"
                    @change="changeRoutineLevel(scope.row)"
                    ><template slot="append">级</template></el-input
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-button type="success" @click="saveSaveFile">保存修改</el-button>
    </el-form>

    <p v-else>请选择存档文件</p>
  </div>
</template>

<script>
import {
  npcData,
  itemData,
  talentNewData,
  neigongData,
  routineExp,
  routineNewData,
} from "../tools/mod-resources";
import dataProcess from "../tools/data-process";
export default {
  name: "ShowSave",
  data() {
    return {
      saveData: {},
      curTeammateId: null,
      curTeammateInfo: {},
      npcs: [],
      items: [],
      neigongs: [],
      talents: [],
      routines: [],
      routineExps: [],
      myNeigongs: [],
      myItems: [],
      myRoutines: [],
      filteredNpcs: [],
      searchItem: null,
      searchNeigong: null,
      searchRoutine: null,
      isAddItem: false,
      isAddNeigong: false,
      isAddRoutine: false,
    };
  },
  props: ["saveFileHandler"],
  computed: {},
  methods: {
    npcInfo(npcId) {
      return this.npcs.find((npc) => npc.ID == npcId) || {};
    },
    chooseTeammate(value) {
      this.curTeammateInfo = this.saveData.m_NpcList.find(
        (n) => n.iNpcID == value
      );
      this.myNeigongs = this.neigongs.map((neigong) => {
        let nei = {};
        Object.assign(nei, neigong);
        let old = this.curTeammateInfo.NeigongList.find(
          (n) => n.iSkillID == neigong.ID
        );
        if (old) {
          Object.assign(nei, old);
        }
        return nei;
      });
      this.myRoutines = this.routines.map((routine) => {
        let myRoutine = {};
        Object.assign(myRoutine, routine);
        let old = this.curTeammateInfo.RoutineList.find(
          (r) => r.iSkillID == routine.iRoutineID
        );
        if (old) {
          Object.assign(myRoutine, old);
        }
        return myRoutine;
      });
    },
    changeNeigongLevel(neigong) {
      let neigongIndex = this.curTeammateInfo.NeigongList.findIndex(
        (n) => n.iSkillID == neigong.ID
      );
      if (neigong.iLevel <= 0 || neigong.iLevel > 10) {
        neigong.iLevel = 0;
        // 删除该内功
        if (neigongIndex != -1) {
          this.curTeammateInfo.NeigongList.splice(neigongIndex, 1);
        }
        return;
      }
      let exp = 0;
      if (neigong.iLevel != 1) {
        let routineExp = this.routineExps.find(
          (e) => e.levelType == neigong.iExp
        );
        if (routineExp) {
          exp = routineExp["level" + neigong.iLevel];
        } else {
          exp = 2000 * neigong.iLevel;
        }
      }

      if (neigongIndex != -1) {
        let old = this.curTeammateInfo.NeigongList[neigongIndex];
        old.iLevel = neigong.iLevel;
        old.m_iAccumulationExp = exp;
      } else {
        this.curTeammateInfo.NeigongList.push({
          iLevel: neigong.iLevel,
          m_iAccumulationExp: exp,
          bUse: false,
          iSkillID: neigong.ID,
        });
      }
    },
    changeRoutineLevel(routine) {
      let routineIdx = this.curTeammateInfo.RoutineList.findIndex(
        (n) => n.iSkillID == routine.iRoutineID
      );
      if (routine.iLevel <= 0 || routine.iLevel > 10) {
        routine.iLevel = 0;
        // 删除该招式
        if (routineIdx != -1) {
          this.curTeammateInfo.RoutineList.splice(routineIdx, 1);
        }
        return;
      }
      let exp = 0;
      if (routine.iLevel != 1) {
        let routineExp = this.routineExps.find(
          (e) => e.levelType == routine.iExp
        );
        if (routineExp) {
          exp = routineExp["level" + routine.iLevel];
        } else {
          exp = 2000 * routine.iLevel;
        }
      }

      if (routineIdx != -1) {
        let old = this.curTeammateInfo.RoutineList[routineIdx];
        old.iLevel = routine.iLevel;
        old.m_iAccumulationExp = exp;
      } else {
        this.curTeammateInfo.RoutineList.push({
          iLevel: routine.iLevel,
          m_iAccumulationExp: exp,
          bUse: false,
          iSkillID: routine.iRoutineID,
        });
      }
    },
    changeItemNumber(item) {
      let oldIndex = this.saveData.m_BackpackList.findIndex(
        (i) => i.m_ItemID == item.ID
      );
      // 删除该物品
      if (item.m_iAmount <= 0) {
        item.m_iAmount = 0;
        if (oldIndex != -1) {
          this.saveData.m_BackpackList.splice(oldIndex, 1);
        }
        return;
      }
      if (oldIndex != -1) {
        let old = this.saveData.m_BackpackList[oldIndex];
        old.m_ItemID = item.m_iAmount;
      } else {
        this.saveData.m_BackpackList.push({
          m_bNew: true,
          m_iAmount: item.m_iAmount,
          m_ItemID: item.ID,
        });
      }
    },
    log(...args) {
      console.log(args);
    },
    saveSaveFile: async function() {
      const writable = await this.saveFileHandler.createWritable();
      await writable.write(JSON.stringify(this.saveData, null, 0));
      await writable.close();
      this.$alert("写入存档成功！")
    }
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
            this.myItems = this.items.map((item) => {
              let myItem = {};
              Object.assign(myItem, item);
              let old = this.saveData.m_BackpackList.find(
                (i) => i.m_ItemID == item.ID
              ) || { m_iAmount: 0 };
              Object.assign(myItem, old);
              return myItem;
            });
          }
        }
      }
    },
  },
  mounted() {
    this.npcs = dataProcess.text2Dict(npcData);
    this.items = dataProcess.text2Dict(itemData);
    this.talents = dataProcess.text2Dict(talentNewData);
    this.neigongs = dataProcess.text2Dict(neigongData);
    this.routines = dataProcess.text2Dict(routineNewData);
    this.routineExps = dataProcess.text2Dict(routineExp);
  },
};
</script>