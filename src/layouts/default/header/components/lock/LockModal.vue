<template>
  <BasicModal
    :footer="null"
    :title="t('layout.header.lockScreen')"
    v-bind="$attrs"
    :class="prefixCls"
    @register="register"
  >
    <div :class="`${prefixCls}__entry`">
      <div :class="`${prefixCls}__header`">
        <Avatar :src="getAvatar" :size="70">
          <Avatar :size="70">{{ getRealName?.charAt(0) }}</Avatar></Avatar
        >
        <p :class="`${prefixCls}__header-name`">
          {{ getRealName }}
        </p>
      </div>

      <BasicForm @register="registerForm" />

      <div :class="`${prefixCls}__footer`">
        <a-button type="primary" block class="mt-2" @click="handleLock">
          {{ t('layout.header.lockScreenBtn') }}
        </a-button>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { Avatar } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal/index';
  import { BasicForm, useForm } from '/@/components/Form/index';

  import { userStore } from '/@/store/modules/user';
  import { lockStore } from '/@/store/modules/lock';
  import headerImg from '/@/assets/images/header.jpg';
  export default defineComponent({
    name: 'LockModal',
    components: { BasicModal, BasicForm, Avatar },

    setup() {
      const { t } = useI18n();
      const { prefixCls } = useDesign('header-lock-modal');

      const getRealName = computed(() => {
        return userStore.getUserInfoState?.name;
      });
      const [register, { closeModal }] = useModalInner();

      const [registerForm, { validateFields, resetFields }] = useForm({
        showActionButtonGroup: false,
        schemas: [
          {
            field: 'password',
            label: t('layout.header.lockScreenPassword'),
            component: 'InputPassword',
            required: true,
          },
        ],
      });

      async function handleLock() {
        const values = (await validateFields()) as any;
        const password: string | undefined = values.password;
        closeModal();

        lockStore.commitLockInfoState({
          isLock: true,
          pwd: password,
        });
        await resetFields();
      }

      const getAvatar = computed(() => {
        const user = userStore.getUserInfoState;
        if (!user['avatar']) {
          // return require(`/@/assets/avatar/default.jpg`);
        } else {
          if (user['avatar'].startsWith('http://') || user['avatar'].startsWith('https://')) {
            return user['avatar'];
          } else {
            // return require(`/@/assets/avatar/${user.avatar}`);
          }
        }
        return user['avatar'];
      });

      return {
        t,
        getAvatar,
        prefixCls,
        getRealName,
        register,
        registerForm,
        handleLock,
        headerImg,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-lock-modal';

  .@{prefix-cls} {
    &__entry {
      position: relative;
      height: 240px;
      padding: 130px 30px 60px 30px;
      background: #fff;
      border-radius: 10px;
    }

    &__header {
      position: absolute;
      top: 0;
      left: calc(50% - 45px);
      width: auto;
      text-align: center;

      &-img {
        width: 70px;
        border-radius: 50%;
      }

      &-name {
        margin-top: 5px;
      }
    }

    &__footer {
      text-align: center;
    }
  }
</style>
