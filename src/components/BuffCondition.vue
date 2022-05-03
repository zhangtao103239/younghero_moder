<template>
  <div id="buff">
    <el-form ref="form" class="el-col-lg-12 el-col-lg-offset-6 el-col-sm-24">
      <el-form-item label="直接输入Buff代码解析">
        <el-input v-model="buffResult" size="medium"></el-input>
        <el-button
          @click="importBuff"
          type="success"
          round
          v-loading.fullscreen.lock="fullscreenLoading"
          >导入</el-button
        >
      </el-form-item>

      <el-card header="Buff基本信息">
        <el-form-item label="BuffID">
          <el-input v-model.number="buff.id" placeholder="请务必大于1000000" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="buff.name" />
        </el-form-item>
        <el-form-item label="Buff图标(例：正面buff22;反面debuff03)">
          <el-input v-model="buff.sIcon" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" :rows="2" v-model="buff.desc"> </el-input>
        </el-form-item>
      </el-card>
      <p></p>
      <el-card header="Buff属性">
        <el-form-item label="Buff类型">
          <el-select placeholder="请选择" v-model="buff.type">
            <el-option
              v-for="(info, id) in buffTypeInfo"
              :key="'buffTypeINfo' + id"
              :label="info"
              :value="id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Buff目标">
          <el-select placeholder="请选择" v-model="buff.target">
            <el-option
              v-for="(info, id) in buffTargetInfo"
              :key="'buffTargetINfo' + id"
              :label="info"
              :value="id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="效果持续的回合数，0为永远存在">
          <el-input-number
            v-model.number="buff.minTurn"
            size="small"
          ></el-input-number>
          <span>回合~</span>
          <el-input-number
            v-model.number="buff.maxTurn"
            size="small"
          ></el-input-number>
          <span>回合</span>
        </el-form-item>
        <el-form-item label="效果在几回合后消失，0为留空或者无限回合">
          <el-input-number v-model="buff.removeByTurn"></el-input-number>
          <span>回合</span>
        </el-form-item>
        <el-form-item label="效果触发几次后消失，0为留空或者无限回合">
          <el-input-number v-model="buff.removeOnAttack"></el-input-number>
          <span>回合</span>
        </el-form-item>
      </el-card>
      <template v-for="(effect, index) in buff.effects">
        <el-card :key="'effectIndex' + index">
          <div slot="header">
            <span>{{ "Buff效果" + (index + 1) }}</span>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              style="float: right"
              @click="buff.effects.splice(index, 1)"
              :disabled="buff.effects.length <= 1"
              size="small"
            ></el-button>
          </div>
          <el-form-item label="Buff作用于">
            <el-select v-model="buff.effects[index].type">
              <el-option
                v-for="(info, id) in buffEffectTypeList"
                :key="'buffEffect' + id"
                :label="info"
                :value="id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Buff效果类型">
            <el-select
              v-model="buff.effects[index].accumulate"
              @change="clearValue(index)"
            >
              <el-option
                v-for="(info, id) in buffAccumulate"
                :key="'buffEffectAccumulate' + id"
                :label="info"
                :value="id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="效果为百分比">
            <el-switch
              v-model="buff.effects[index].percent"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
              active-value="1"
              inactive-value="0"
            />
          </el-form-item>
          <template v-if="effect.accumulate != 7 && effect.accumulate != 10">
            <el-form-item label="每回合造成的伤害或者回复的数值">
              <el-input-number
                v-model.number="buff.effects[index].value1"
                size="small"
              ></el-input-number>
              <span v-if="effect.percent == 1">% </span>
              <span>到</span>
              <el-input-number
                v-model.number="buff.effects[index].value2"
                size="small"
              ></el-input-number>
              <span v-if="effect.percent == 1">% </span>
            </el-form-item>
            <el-form-item
              label="效果累加极限值"
              v-if="['0', '1', '4'].indexOf(effect.accumulate) > -1"
            >
              <el-input-number
                v-model.number="buff.effects[index].valueLimit"
              ></el-input-number>
              <span v-if="effect.percent == 1">% </span>
            </el-form-item>
            <el-form-item v-else label="自身周围">
              <el-input-number
                v-model.number="buff.effects[index].valueLimit"
              ></el-input-number>
              <span>格内有作用</span>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item
              :label="effect.accumulate == 7 ? '成功后触发' : '限制数值触发'"
            >
              <el-select
                v-if="buff.effects[index].exchangeValue"
                popper-class="el-col-13"
                placeholder="输入关键词搜索,空格显示全部"
                class="el-col-12"
                filterable
                :filter-method="doBuffQuery"
                v-model="buff.effects[index].value1"
              >
                <el-option
                  v-for="condition in querySkillConditions"
                  :label="condition.CondName"
                  :key="condition.ConditionID"
                  :value="condition.ConditionID"
                >
                  <span style="float: left">{{ condition.CondName }}</span>
                  <span
                    style="
                      float: right;
                      font-size: 0.7rem;
                      text-overflow: ellipsis;
                    "
                    >{{
                      condition.CondDesc
                        ? condition.CondDesc.slice(
                            -70 + condition.CondName.length
                          )
                        : ""
                    }}
                  </span>
                </el-option>
              </el-select>
              <el-select
                v-else
                popper-class="el-col-13"
                placeholder="输入关键词搜索,空格显示全部"
                class="el-col-12"
                filterable
                :filter-method="doBuffQuery"
                v-model="buff.effects[index].value2"
              >
                <el-option
                  v-for="condition in querySkillConditions"
                  :label="condition.CondName"
                  :key="condition.ConditionID"
                  :value="condition.ConditionID"
                >
                  <span style="float: left">{{ condition.CondName }}</span>
                  <span
                    style="
                      float: right;
                      font-size: 0.7rem;
                      text-overflow: ellipsis;
                    "
                    >{{
                      condition.CondDesc
                        ? condition.CondDesc.slice(
                            -70 + condition.CondName.length
                          )
                        : ""
                    }}</span
                  >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="极限数值"
              v-if="buff.effects[index].accumulate == 10"
            >
              <el-input-number
                v-model.number="buff.effects[index].valueLimit"
              ></el-input-number>
              <span v-if="effect.percent == 1">% </span>
            </el-form-item>
            <el-form-item>
              <el-switch
                v-model="buff.effects[index].exchangeValue"
                :active-text="
                  effect.accumulate == 7 ? '给自己' : '数值以下触发'
                "
                :inactive-text="
                  effect.accumulate == 7 ? '给敌人' : '数值以上触发'
                "
                @change="exchangeValue(index)"
              ></el-switch>
            </el-form-item>
          </template>
        </el-card>
      </template>
      <el-form-item>
        <el-button
          type="primary"
          size="small"
          @click="
            buff.effects.push({
              type: '',
              accumulate: '',
              percent: 1,
              value1: '',
              value2: '',
              valueLimit: 0,
              exchangeValue: true,
            })
          "
        >
          增加Buff效果
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="success"
          icon="el-icon-circle-check"
          @click="generateBuff"
          v-loading.fullscreen.lock="fullscreenLoading"
          >生成Buff
        </el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="生成成功"
      :visible.sync="resultNoticeVisible"
      width="20rem"
    >
      <span>请将下面的代码复制到你的mod文件中</span>
      <el-input v-model="buffResult"></el-input>
    </el-dialog>
  </div>
</template>

<script>
import dataProcess from "../tools/data-process";
import { buffEffectTypeInfo, conditionsData } from "../tools/mod-resources";
export default {
  name: "BuffCondition",
  data() {
    return {
      buff: {
        id: "",
        name: "",
        desc: "",
        sIcon: "buff22",
        type: "",
        target: "",
        minTurn: 0,
        maxTurn: 0,
        removeByTurn: 0,
        removeOnAttack: 0,
        effects: [
          {
            type: "",
            accumulate: "",
            percent: 1,
            value1: "",
            value2: "",
            valueLimit: 0,
            exchangeValue: true,
          },
        ],
      },
      buffResult: "",
      buffTypeInfo: {
        0: "正面技能",
        1: "负面技能",
        2: "具有正面效果的攻击技能",
        3: "具有负面效果的攻击技能",
        4: "连击技能",
      },
      buffTargetInfo: {
        0: "自己",
        1: "敌人",
        2: "友军",
      },
      buffEffectTypeList: {},
      buffAccumulate: {
        0: "留空",
        1: "叠加类技能比如四御",
        4: "自身固定buff",
        5: "周围友军",
        6: "敌人靠近时触发",
        7: "成功时触发另一个技能",
        9: "周围敌人",
        10: "限制数值时触发另一个技能",
      },
      conditions: [],
      fullscreenLoading: false,
      resultNoticeVisible: false,
      querySkillConditions: [],
    };
  },
  computed: {},
  methods: {
    importBuff() {
      this.querySkillConditions = [];
      let result = this.buffResult.split("\t");
      if (result.length > 15) {
        this.fullscreenLoading = true;
        [
          this.buff.id,
          this.buff.name,
          this.buff.desc,
          this.buff.sIcon,
          this.buff.type,
          this.buff.target,
          this.buff.minTurn,
          this.buff.maxTurn,
          this.buff.removeByTurn,
          this.buff.removeOnAttack,
        ] = result.slice(0, 10);
        this.buff.effects = [];
        let effectList = result.slice(10);
        while (effectList.length > 0) {
          let type = effectList.shift();
          let accumulate = effectList.shift();
          let percent = effectList.shift();
          let value1 = effectList.shift();
          let value2 = effectList.shift();
          let valueLimit = effectList.shift();
          let exchangeValue = value2 == "0";
          if (type.trim() == "") {
            break;
          }
          this.querySkillConditions.push(...this.conditions.filter(c => c.ConditionID == value1 || c.ConditionID == value2))
          this.buff.effects.push({
            type: type,
            accumulate: accumulate,
            percent: percent,
            value1: value1,
            value2: value2,
            valueLimit: valueLimit,
            exchangeValue: exchangeValue,
          });
        }
        this.fullscreenLoading = false;
      } else {
        this.$alert("输入格式有误，请检查", "错误");
      }
    },
    exchangeValue(index) {
      let effect = this.buff.effects[index];
      var temp = effect.value1;
      effect.value1 = effect.value2;
      effect.value2 = temp;
    },
    generateBuff() {
      this.fullscreenLoading = true;
      //生成Buff代码
      let result = [
        this.buff.id,
        this.buff.name,
        this.buff.desc,
        this.buff.sIcon,
        this.buff.type,
        this.buff.target,
        this.buff.minTurn,
        this.buff.maxTurn,
        this.buff.removeByTurn,
        this.buff.removeOnAttack,
      ];
      this.buff.effects.forEach((effect) => {
        result.push(effect.type);
        result.push(effect.accumulate);
        result.push(effect.percent);
        result.push(effect.value1);
        result.push(effect.value2);
        result.push(effect.valueLimit);
      });
      this.buffResult = result.join("\t");
      this.fullscreenLoading = false;
      this.resultNoticeVisible = true;
    },
    doBuffQuery(query) {
      if (query == "")
        this.querySkillConditions = this.conditions.slice(0, 100);
      else {
        this.querySkillConditions = this.conditions.filter((item) => {
          if (item.CondName && item.CondName.indexOf(query) > -1) return true;
          else if (item.CondDesc && item.CondDesc.indexOf(query) > -1)
            return true;
          return false;
        });
      }
    },
    clearValue(index) {
      let effect = this.buff.effects[index];
      effect.value1 = 0;
      effect.value2 = 0;
    },
  },
  mounted() {
    const buff = this;
    buff.buffEffectTypeList = buffEffectTypeInfo;
    buff.conditions = dataProcess.text2Dict(conditionsData);
    buff.querySkillConditions = buff.conditions.slice(0, 100);
  },
};
</script>

<style scoped>
</style>