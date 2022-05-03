<template>
  <div id="neigong">
    <el-form ref="form" class="el-col-lg-12 el-col-lg-offset-6 el-col-sm-24">
      <el-form-item label="直接输入内功代码解析">
        <el-input v-model="ng.ngResult" size="medium"></el-input>
        <el-button
          @click="importNg"
          type="success"
          round
          v-loading.fullscreen.lock="fullscreenLoading"
          >导入</el-button
        >
      </el-form-item>

      <el-card header="内功基本信息">
        <el-form-item label="内功ID">
          <el-input v-model.number="ng.id" placeholder="请务必大于90000" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="ng.name" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" :rows="2" v-model="ng.desc"> </el-input>
        </el-form-item>
      </el-card>
      <el-form-item label="修炼难度" style="padding-top: 20px">
        <el-input-number :min="1" :max="11" v-model="ng.iExp"></el-input-number>
      </el-form-item>

      <el-card header="升级效果">
        <el-form-item
          :label="'升级效果' + (index + 1)"
          v-for="(up, index) in ng.levelUp"
          :key="'upLevel' + index"
        >
          <el-col :span="5" :offset="2">
            <el-select
              filterable
              placeholder="请选择"
              v-model="ng.levelUp[index].propertyId"
            >
              <el-option
                v-for="(propertyName, propertyId) in ruleProperties"
                :key="propertyId"
                :label="propertyName"
                :value="propertyId"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="5" :offset="1">
            <el-input-number
              v-model="ng.levelUp[index].increaseNum"
            ></el-input-number>
          </el-col>
          <el-col :span="4">
            <el-button
              @click="delItem(ng.levelUp, index)"
              :disabled="ng.levelUp.length <= 1"
              ><i class="el-icon-delete"></i
            ></el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button v-on:click="addPropertyItem(ng.levelUp)"
            >增加升级效果</el-button
          >
        </el-form-item>
      </el-card>
      <el-form-item label="升级数据展示">
        <el-input :disabled="true" v-model="upLevelNum"></el-input>
      </el-form-item>

      <el-card header="满级效果">
        <el-form-item
          :label="'满级效果' + (index + 1)"
          v-for="(up, index) in ng.levelMax"
          :key="'maxLevel' + index"
        >
          <el-col :span="5" :offset="2">
            <el-select
              filterable
              placeholder="请选择"
              v-model="ng.levelMax[index].propertyId"
            >
              <el-option
                v-for="(propertyName, propertyId) in ruleProperties"
                :key="propertyId"
                :label="propertyName"
                :value="propertyId"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="5" :offset="1">
            <el-input-number
              v-model="ng.levelMax[index].increaseNum"
            ></el-input-number>
          </el-col>
          <el-col :span="4">
            <el-button
              @click="delItem(ng.levelMax, index)"
              :disabled="ng.levelMax.length <= 1"
              ><i class="el-icon-delete"></i
            ></el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button v-on:click="addPropertyItem(ng.levelMax)"
            >增加满级效果</el-button
          >
        </el-form-item>
      </el-card>
      <el-form-item label="满级数据展示">
        <el-input :disabled="true" v-model="maxLevelNum"></el-input>
      </el-form-item>

      <el-card header="内功技能">
        <el-form-item
          :label="
            skill.level === 0 ? '常备技能' : '满' + skill.level + '重技能'
          "
          v-for="(skill, index) in ng.skills"
          :key="'skill' + index"
        >
          <el-input-number
            :min="0"
            :max="10"
            v-model="ng.skills[index].level"
          ></el-input-number>
          <el-select
            filterable
            remote
            :remote-method="querySkillCondition"
            v-model="ng.skills[index].skillId"
            :loading="queryLoading"
            placeholder="输入关键词搜索,空格显示全部"
            class="el-col-12"
          >
            <el-option
              v-for="condition in querySkillConditions"
              :label="condition.name"
              :key="condition.id"
              :value="condition.id"
              :title="condition.description"
            >
              <span style="float: left">{{ condition.name }}</span>
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
                >{{ condition.description }}</span
              >
            </el-option>
          </el-select>
          <el-button
            @click="delItem(ng.skills, index)"
            :disabled="ng.skills.length <= 4"
            ><i class="el-icon-delete"></i
          ></el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-on:click="ng.skills.push({ level: 1, skillId: '' })"
            >增加技能</el-button
          >
        </el-form-item>
      </el-card>
      <el-form-item label="内功说明">
        <el-input type="textarea" :rows="2" v-model="levelDesc"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-circle-check"
          @click="generateNG"
          v-loading.fullscreen.lock="fullscreenLoading"
          >生成内功
        </el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="生成成功"
      :visible.sync="resultNoticeVisible"
      width="20rem"
    >
      <span>请将下面的代码复制到你的mod文件中</span>
      <el-input v-model="ng.ngResult"></el-input>
    </el-dialog>
  </div>
</template>

<script>
import dataProcess from "../tools/data-process";
import { ruleProperties, conditionsData } from "../tools/mod-resources";

export default {
  name: "NeiGong",
  data() {
    return {
      ng: {
        id: "",
        name: "",
        desc: "",
        levelUp: [{ propertyId: "", increaseNum: 0 }],
        levelMax: [{ propertyId: "", increaseNum: 0 }],
        iExp: 1,
        skills: [
          {
            level: 1,
            skillId: "",
          },
          {
            level: 7,
            skillId: "",
          },
          {
            level: 10,
            skillId: "",
          },
          {
            level: 0,
            skillId: "",
          },
        ],
        sIcon: "NeigongImage25",
        ngResult: "",
      },
      title: "创建内功",
      queryLoading: false,
      ruleProperties: {},
      conditions: [],
      querySkillConditions: [],
      resultNoticeVisible: false,
      fullscreenLoading: false,
    };
  },
  computed: {
    upLevelNum: {
      get: function () {
        let result = "";
        this.ng.levelUp.forEach(function (value, index) {
          if (index !== 0) result += "*";
          result +=
            "(" + value["propertyId"] + "," + value["increaseNum"] + ")";
        });
        return result;
      },
      set: function (newValue) {
        const ngThis = this;
        ngThis.ng.levelUp = [];
        newValue.split("*").forEach((n) => {
          let propertyGroup = n.split(",");
          ngThis.ng.levelUp.push({
            propertyId: propertyGroup[0].slice(1),
            increaseNum: propertyGroup[1].slice(0, -1),
          });
        });
      },
    },
    maxLevelNum: {
      get: function () {
        let result = "";
        this.ng.levelMax.forEach(function (value, index) {
          if (index !== 0) result += "*";
          result +=
            "(" + value["propertyId"] + "," + value["increaseNum"] + ")";
        });
        return result;
      },
      set: function (newValue) {
        const ngThis = this;
        ngThis.ng.levelMax = [];
        newValue.split("*").forEach((n) => {
          let propertyGroup = n.split(",");
          ngThis.ng.levelMax.push({
            propertyId: propertyGroup[0].slice(1),
            increaseNum: propertyGroup[1].slice(0, -1),
          });
        });
      },
    },
    levelDesc() {
      var result = "";
      let neigong = this;
      this.ng.levelUp.forEach(function (value, index) {
        let id = value["propertyId"];
        let name = neigong.ruleProperties[id];
        if (index !== 0) result += "，";
        result += name + "+" + value["increaseNum"];
      });
      result += " [c][12C0D3]<br>满重增益：";
      this.ng.levelMax.forEach(function (value, index) {
        let id = value["propertyId"];
        let name = neigong.ruleProperties[id];
        if (index !== 0) result += "，";
        result += name + "+" + value["increaseNum"];
      });
      result += "[-][/c]<br>";
      this.ng.skills.forEach((value) => {
        const condition = value["level"];
        let skillId = value["skillId"];
        neigong.conditions.forEach((n) => {
          if (n["id"] === skillId) {
            if (condition !== 0) {
              result += condition + "重 " + n["name"] + " ";
            } else {
              result += "常备 " + n["name"] + " ";
            }
          }
        });
      });
      return result;
    },
    conditionSkill: {
      get: function () {
        let result = [];
        let reason = "(10,0," + this.ng.id + ",";
        this.ng.skills.forEach((skill) => {
          result.push(skill.skillId);
          result.push(reason + skill.level + ")");
        });
        return result;
      },
      set: function (newValue) {
        this.ng.skills = [];
        this.querySkillConditions = [];
        const NG = this;
        while (newValue.length > 0) {
          let skillId = newValue.shift();
          let condition = NG.conditions.find((n) => n.id == skillId);
          if (condition) {
            NG.querySkillConditions.push(condition);
          } else {
            NG.querySkillConditions.push({
              id: skillId,
              name: "unKnown技能",
              description: "也许是mod中的技能，效果未知",
            });
          }

          let level = newValue.shift();
          if (!level) level = "(10,0," + NG.ng.id + ",0)";
          level = level.split(",").pop().slice(0, -1);
          NG.ng.skills.push({
            level: level,
            skillId: skillId,
          });
        }
      },
    },
  },
  methods: {
    addPropertyItem(levelList) {
      levelList.push({ propertyId: "", increaseNum: 0 });
    },
    delItem(lit, i) {
      lit.splice(i, 1);
    },
    generateNG() {
      this.fullscreenLoading = true;
      var ngInfo = [
        this.ng.id,
        this.ng.name,
        this.ng.desc,
        this.levelDesc,
        this.upLevelNum,
        this.maxLevelNum,
        this.ng.iExp,
        this.ng.sIcon,
      ];
      this.ng.ngResult = ngInfo.concat(this.conditionSkill).join("\t");
      this.fullscreenLoading = false;
      this.resultNoticeVisible = true;
    },
    querySkillCondition(query) {
      this.queryLoading = true;
      if (query.trim() === "") this.querySkillConditions = this.conditions;
      else {
        this.querySkillConditions = this.conditions.filter((item) => {
          if (item.name && item.name.indexOf(query) > -1) return true;
          else if (item.description && item.description.indexOf(query) > -1)
            return true;
          else if (item.id && item.id.indexOf(query) > -1) return true;
          return false;
        });
      }
      this.queryLoading = false;
    },
    importNg() {
      let result = this.ng.ngResult.split("\t");
      if (result.length > 10) {
        this.fullscreenLoading = true;
        let _;
        [
          this.ng.id,
          this.ng.name,
          this.ng.desc,
          _,
          this.upLevelNum,
          this.maxLevelNum,
          this.ng.iExp,
          this.ng.sIcon,
        ] = result.slice(0, 8);
        console.log(_);
        this.conditionSkill = result.slice(8);
        this.fullscreenLoading = false;
      } else {
        this.$alert("输入格式有误，请检查", "错误");
      }
    },
  },
  mounted() {
    const neigong = this;
    neigong.ruleProperties = ruleProperties;
    neigong.conditions = dataProcess.text2Dict(conditionsData);
  },
};
</script>

<style scoped>
</style>