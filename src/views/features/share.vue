<template>
  <van-tabs
    type="card"
    color="#38b69b"
    v-model="shareInfo.mode"
    :animated="true"
    :swipeable="true"
  >
    <van-tab title="普通分享">
      <van-form label-width="50%">
        <van-cell-group>
          <van-field
            :border="true"
            readonly
            clickable
            label="有效分享时间"
            :value="shareInfo.time"
            placeholder="请选择分享有效时间"
            required
            @click="dswitch.time = true"
          />
        </van-cell-group>

        <van-cell-group>
          <van-field name="switch" label="启用加密分享">
            <template #input>
              <van-switch v-model="shareInfo.encrypt" size="25" />
            </template>
          </van-field>
        </van-cell-group>

        <van-cell-group>
          <van-field name="switch" label="可以查看历史记录">
            <template #input>
              <van-switch v-model="shareInfo.history" size="25" />
            </template>
          </van-field>
        </van-cell-group>

        <van-cell-group>
          <van-field name="switch" label="匿名化分享">
            <template #input>
              <van-switch v-model="shareInfo.anonymous" size="25" />
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </van-tab>
    <van-tab title="面对面分享" style="text-align: center">
      <div v-show="f2f_init">
        <div style="margin-top: 20px">在电脑上打开以下链接</div>
        <div style="font-weight: 700">medimage.online/pc</div>
        <div style="padding-top: 10px">然后输入以下分享码</div>
        <div
          style="margin: 16px 0px; font-weight: 700; font-size: 25px"
          v-text="f2f_code"
        ></div>
        <van-circle
          v-model="currentRate"
          :rate="f2f_value"
          size="42px"
          stroke-width="200"
        />
      </div>
      <div v-show="!f2f_init">
        <div style="margin: 20px" v-text="f2f_msg"></div>
      </div>
    </van-tab>
  </van-tabs>
</template>
