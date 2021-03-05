<template>
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow">
    <FormItem name="grantType">
      <Input size="large" v-model:value="formData.grantType" :hidden="true" />
    </FormItem>
    <FormItem name="key">
      <Input size="large" v-model:value="formData.key" :hidden="true" />
    </FormItem>
    <FormItem name="tenantView" v-show="formState.isMultiTenant" class="enter-x">
      <Input
        size="large"
        v-model:value="formData.tenantView"
        :placeholder="t('sys.login.tenant')"
      />
    </FormItem>
    <FormItem name="account" class="enter-x">
      <Input size="large" v-model:value="formData.account" :placeholder="t('sys.login.userName')" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>

    <ARow class="enter-x" v-show="formState.showCaptcha">
      <ACol>
        <FormItem class="code-input" name="code">
          <Input
            size="large"
            visibilityToggle
            v-model:value="formData.code"
            :placeholder="t('sys.login.captcha')"
          />
        </FormItem>

        <img
          v-show="true"
          :src="formState.captchaSrc"
          @click="loadCaptcha"
          alt="captcha"
          class="code-image"
        />
      </ACol>
    </ARow>

    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="formState.loading">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
    <ARow class="enter-x">
      <ACol :xs="24" :md="8">
        <Button block @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('sys.login.mobileSignInFormTitle') }}
        </Button>
      </ACol>
      <ACol :md="8" :xs="24" class="xs:my-2 md:my-0 xs:mx-0 md:mx-2">
        <Button block @click="setLoginState(LoginStateEnum.QR_CODE)">
          {{ t('sys.login.qrSignInFormTitle') }}
        </Button>
      </ACol>
      <ACol :md="7" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
          {{ t('sys.login.registerButton') }}
        </Button>
      </ACol>
    </ARow>

    <Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>

    <div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div>
  </Form>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, toRaw, unref, computed, onMounted } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button, Divider } from 'ant-design-vue';
  import {
    GithubFilled,
    WechatFilled,
    AlipayCircleFilled,
    GoogleCircleFilled,
    TwitterCircleFilled,
  } from '@ant-design/icons-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { userStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useKeyPress } from '/@/hooks/event/useKeyPress';
  import { KeyCodeEnum } from '/@/enums/keyCodeEnum';
  import { randomNum } from '/@/utils';

  export default defineComponent({
    name: 'LoginForm',
    components: {
      [Col.name]: Col,
      [Row.name]: Row,
      Checkbox,
      Button,
      Form,
      FormItem: Form.Item,
      Input,
      Divider,
      LoginFormTitle,
      InputPassword: Input.Password,
      GithubFilled,
      WechatFilled,
      AlipayCircleFilled,
      GoogleCircleFilled,
      TwitterCircleFilled,
    },
    setup() {
      const { t } = useI18n();
      const { notification } = useMessage();
      const { prefixCls } = useDesign('login');

      const globSetting = useGlobSetting();
      const { setLoginState, getLoginState } = useLoginState();
      const { getFormRules } = useFormRules();

      const formRef = ref<any>(null);
      const rememberMe = ref(false);

      onMounted(() => {
        loadCaptcha();
      });

      const formData = reactive({
        tenant: '',
        tenantView: '0000',
        account: 'lamp',
        password: 'lamp',
        code: '',
        grantType: globSetting.showCaptcha === 'true' ? 'captcha' : 'password',
        key: randomNum(24, 16),
        verify: undefined,
      });

      const formState = reactive({
        loading: false,
        captchaSrc: '',
        isMultiTenant: globSetting.multiTenantType !== 'NONE',
        showCaptcha: globSetting.showCaptcha === 'true',
      });
      // 加载验证码
      async function loadCaptcha() {
        const captcha = await userStore.loadCaptcha({ key: formData.key });
        formState.captchaSrc = captcha;
      }

      const { validForm } = useFormValid(formRef);
      useKeyPress(['enter'], (events) => {
        const keyCode = events.keyCode;

        if (keyCode === KeyCodeEnum.ENTER) {
          handleLogin();
        }
      });

      const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

      async function handleLogin() {
        const data = await validForm();
        if (!data) return;
        try {
          formState.loading = true;
          const userInfo = await userStore.login(toRaw(data));
          if (userInfo) {
            notification.success({
              message: t('sys.login.loginSuccessTitle'),
              description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.name}`,
              duration: 3,
            });
          } else {
            loadCaptcha();
          }
        } finally {
          formState.loading = false;
        }
      }

      return {
        t,
        prefixCls,
        formRef,
        formData,
        getFormRules,
        rememberMe,
        handleLogin,
        loadCaptcha,
        setLoginState,
        LoginStateEnum,
        getShow,
        formState,
      };
    },
  });
</script>
