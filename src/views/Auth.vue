<template>
  <div class="mainpage">
    <Logo />
    <div id="login">
      <div class="info">{{ info }}</div>
    </div>
  </div>
</template>
<script>
import Logo from "@/components/logo.vue";
import {
  authRegid,
  authDecrypt,
  transHospitalID,
  authIdcard,
} from "@/api/auth";
export default {
  components: { Logo },
  data() {
    return {
      info: "登陆中...",
    };
  },
  async mounted() {
    // 获取认证的方法
    const query = this.$route.query;
    const method = this.$route.params.method;
    if (!method) {
      this.info = "链接参数错误，请确定链接正确性";
      return;
    }
    switch (method) {
      default:
        console.warn("!!!", this.$route.params);
        break;
      case "stardard": //通过regid和医院ID然后跳转到登陆页
        break;
      case "regid": {
        //通过regid，医院ID和手机号登陆
        const { hospital_code, reg_id, phone_number } = query;
        authRegid(reg_id, hospital_code, phone_number)
          .then((response) => {
            switch (response.error) {
              case 0:
                this.info = "登陆成功 跳转中...";
                this.jumpToHome();
                break;
              case 1:
                this.info = "登陆失败 请返回重试";
                break;
              case -10:
                this.info = "登陆失败 参数错误";
                console.warn("参数错误");
                break;
              default:
                console.warn("未捕捉的case");
                break;
            }
          })
          .catch((error) => {
            this.info = error;
          });
        break;
      }
      case "idcard": {
        // 患者智能服务
        let hospital = query.hospital_code;
        let id_card = query.id_card;
        let phone_number = query.phone_number;
        // 解密数据
        let response = await authDecrypt(phone_number, id_card);
        if (response.error != 0 || response.hospital == "") {
          this.info = "参数解密失败，请刷新重试";
          break;
        }
        phone_number = response.phone;
        id_card = response.idcard;
        // 先将医院ID转换为云胶片医院ID
        let res = await transHospitalID(hospital);
        if (res.id == -1) {
          this.info = "医院ID转换失败 请联系技术人员";
          break;
        }
        const hospital_code = res.data.id;
        // 开始认证
        const data = await authIdcard(id_card, hospital_code, phone_number);
        switch (data.error) {
          case 0:
            this.info = "登陆成功 跳转中...";
            this.jumpToHome();
            break;
          case 1:
            this.info = "暂未查询到您的影像就诊数据";
            break;
          case -10:
            this.info = "登陆失败 参数错误";
            console.warn("参数错误");
            break;
          default:
            console.warn("未捕捉的case");
        }
        break;
      }
    }
  },
  methods: {
    jumpToHome(data = {}) {
      //跳转到URL指定的页面
      switch (this.$route.params.dest) {
        default:
          this.info = "跳转目标参数错误";
          break;
        case "list":
          this.$router.replace("/history");
          break;
        case "index":
          this.$router.replace({
            path: "/home",
            query: {
              hospital_code: data.hospital,
              reg_id: data.reg_id,
            },
          });
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#login {
  position: absolute;
  top: 35%;
  left: 50%;
  background: url("../assets/littlebg.png") no-repeat;
  transform: translate(-50%, 0%);
  box-sizing: border-box;
  text-align: center;
  border-radius: 10px;
  padding: 0px 10px;
  margin: 0px auto;
  width: 90%;
  height: 30vh;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;

  .info {
    padding: 0 20px;
    font-size: 24px;
    font-weight: 700;
  }
}
</style>
