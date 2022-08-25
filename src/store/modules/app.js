import Vue from "vue";

const defaultState = {
  debugSwitch: false,
};
const state = {
  ...defaultState,
};
const mutations = {
  SWITCH_UPDATE(state, stateValue) {
    Vue.set(state, "debugSwitch", stateValue);
  },
};
const actions = {
  setSwitchState({ commit }, stateValue) {
    commit("SWITCH_UPDATE", stateValue);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
