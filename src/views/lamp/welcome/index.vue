<template>
  <div class="p-4 analysis">
    <a-row class="pl-2">
      <template v-for="item in formState.growCardList" :key="item.title">
        <a-col :sm="24" :md="12" :lg="6">
          <GrowCard :info="item" />
        </a-col>
      </template>
    </a-row>

    <a-row class="pl-2">
      <a-col :md="24" :lg="24" class="my-3">
        <CollapseContainer class="mr-3" title="近十天访问记录" :canExpan="false">
          <div ref="tenVisitRef" :style="{ height: '280px', width: '100%' }"></div>
        </CollapseContainer>
        <a-row class="mt-3">
          <a-col :md="24" :lg="12" class="product-total">
            <CollapseContainer class="mr-3" title="访问用户浏览器" :canExpan="false">
              <div ref="browserRef" :style="{ height: '280px', width: '100%' }"></div>
            </CollapseContainer>
          </a-col>
          <a-col :md="24" :lg="12">
            <CollapseContainer class="mr-3" title="访问用户操作系统" :canExpan="false">
              <div ref="operatingSystemRef" :style="{ height: '280px', width: '100%' }"></div>
            </CollapseContainer>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, reactive, ref, Ref } from 'vue';
  import GrowCard from './components/GrowCard.vue';
  import { CollapseContainer } from '/@/components/Container/index';
  import { Row, Col } from 'ant-design-vue';
  import { growCardList } from './data';
  import { getVisitList } from '/@/api/authority/welcome';

  import type { EChartsOption } from 'echarts';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { parseTime } from '/@/utils';
  import { simplePie, simpleBar } from '/@/utils/chartsOption';

  export default defineComponent({
    name: 'Welcome',
    components: {
      GrowCard,
      CollapseContainer,
      [Row.name]: Row,
      [Col.name]: Col,
    },
    setup() {
      const tenVisitRef = ref<HTMLDivElement | null>(null);
      const browserRef = ref<HTMLDivElement | null>(null);
      const operatingSystemRef = ref<HTMLDivElement | null>(null);
      const tenVisitSetOptions = useECharts(tenVisitRef as Ref<HTMLDivElement>).setOptions;
      const browserCountSetOptions = useECharts(browserRef as Ref<HTMLDivElement>).setOptions;
      const operatingSystemSetOptions = useECharts(operatingSystemRef as Ref<HTMLDivElement>)
        .setOptions;

      const formState = reactive({
        growCardList,
        lastTenVisitCount: [],
        lastTenUserVisitCount: [],
      });

      onMounted(() => {
        loadVisitList();
      });

      async function loadVisitList() {
        const data = await getVisitList();
        formState.growCardList[0].price = Number(data.userCount);
        formState.growCardList[1].price = Number(data.todayIp);
        formState.growCardList[2].price = Number(data.totalVisitCount);
        formState.growCardList[3].price = Number(data.todayVisitCount);

        bar(data.lastTenVisitCount, data.lastTenUserVisitCount);
        browserCount(data.browserCount);
        operatingSystemCount(data.operatingSystemCount);
      }

      function bar(lastTenVisitCount, lastTenUserVisitCount) {
        const tenVisitCount = [] as number[];
        const dateArr = [] as string[];
        const tenUserVisitCount = [] as number[];
        const visitBar = simpleBar();

        for (let i = 9; i >= 0; i--) {
          const time = parseTime(
            new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * i),
            '{y}-{m}-{d}'
          );
          let contain = false;
          for (const o of lastTenVisitCount) {
            if (o.login_date === time) {
              contain = true;
              tenVisitCount.push(o.count);
              break;
            }
          }
          if (!contain) {
            tenVisitCount.push(0);
          }

          let userContain = false;
          for (const o of lastTenUserVisitCount) {
            if (o.login_date === time) {
              userContain = true;
              tenUserVisitCount.push(o.count);
              break;
            }
          }
          if (!userContain) {
            tenUserVisitCount.push(0);
          }
          dateArr.push(time);
        }

        visitBar.legend.data = ['您', '总数'];
        visitBar.xAxis.data = dateArr;
        visitBar.series.push({
          name: '您',
          type: 'line',
          barWidth: '25%',
          color: 'rgb(0, 227, 150)',
          data: tenUserVisitCount,
        });
        visitBar.series.push({
          name: '总数',
          type: 'bar',
          barWidth: '25%',
          color: 'rgb(0, 143, 251)',
          data: tenVisitCount,
        });

        tenVisitSetOptions(visitBar as EChartsOption);
      }

      function browserCount(data) {
        if (!data) {
          return;
        }
        const browserPie = simplePie();
        const legend_data = [] as string[];
        const series_data = [] as any[];
        data.forEach((item) => {
          const browser = item.browser || '未知';
          series_data.push({ value: item.count, name: browser });
          legend_data.push(browser);
        });

        browserPie.series[0].data = series_data;
        browserPie.legend.data = legend_data;

        browserCountSetOptions(browserPie as EChartsOption);
      }

      function operatingSystemCount(data) {
        if (!data) {
          return;
        }
        const operatingSystemPie = simplePie();
        const legend_data = [] as string[];
        const series_data = [] as any[];
        data.forEach((item) => {
          const browser = item.operating_system || '未知';
          series_data.push({ value: item.count, name: browser });
          legend_data.push(browser);
        });

        operatingSystemPie.series[0].data = series_data;
        operatingSystemPie.legend.data = legend_data;

        operatingSystemSetOptions(operatingSystemPie as EChartsOption);
      }
      return { formState, tenVisitRef, browserRef, operatingSystemRef };
    },
  });
</script>
<style lang="less" scoped>
  .analysis {
    width: 100%;
  }
</style>
