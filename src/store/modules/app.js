import Vue from "vue";

const defaultState = {
  debugSwitch: false,
  isObtainConfig: false,
  config: {
    title: "",
    logoUrl: "",
  },
};
const state = {
  ...defaultState,
};
const mutations = {
  SWITCH_UPDATE(state, stateValue) {
    Vue.set(state, "debugSwitch", stateValue);
  },
  CONFIG_UPDATE(state, stateValue) {
    Vue.set(state, "config", stateValue);
  },
  OBTAINCONFIG_UPDATE(state, stateValue) {
    Vue.set(state, "isObtainConfig", stateValue);
  },
};
const actions = {
  setSwitchState({ commit }, stateValue) {
    commit("SWITCH_UPDATE", stateValue);
  },
  setObtainConfig({ commit }, configValue) {
    commit("OBTAINCONFIG_UPDATE", configValue);
  },
  setConfig({ commit }, configValue) {
    commit("CONFIG_UPDATE", configValue);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
